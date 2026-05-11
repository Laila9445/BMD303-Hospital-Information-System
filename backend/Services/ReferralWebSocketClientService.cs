using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Channels;
using CLINICSYSTEM.Data.DTOs;
using Microsoft.Extensions.Options;

namespace CLINICSYSTEM.Services;

public class ReferralWebSocketClientService : BackgroundService, IReferralWebSocketClient
{
    private readonly ILogger<ReferralWebSocketClientService> _logger;
    private readonly ReferralWebSocketOptions _options;
    private readonly Channel<QueuedReferralSend> _sendQueue;
    private readonly ConcurrentDictionary<string, TaskCompletionSource<bool>> _pendingAcks;
    private readonly SemaphoreSlim _connectionGate = new(1, 1);
    private readonly JsonSerializerOptions _jsonOptions;
    private ClientWebSocket? _socket;
    private Task? _receiveLoopTask;
    private Task? _heartbeatTask;

    public ReferralWebSocketClientService(
        ILogger<ReferralWebSocketClientService> logger,
        IOptions<ReferralWebSocketOptions> options)
    {
        _logger = logger;
        _options = options.Value;
        _sendQueue = Channel.CreateUnbounded<QueuedReferralSend>();
        _pendingAcks = new ConcurrentDictionary<string, TaskCompletionSource<bool>>(StringComparer.OrdinalIgnoreCase);
        _jsonOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Referral WebSocket background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await EnsureConnectedAsync(stoppingToken);
                await ProcessQueueOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in referral WebSocket service loop");
                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
        }
    }

    public async Task<bool> SendReferralAsync(ReferralData referral, CancellationToken cancellationToken = default)
    {
        Validator.ValidateObject(referral, new ValidationContext(referral), validateAllProperties: true);
        Validator.ValidateObject(referral.Patient, new ValidationContext(referral.Patient), validateAllProperties: true);

        var completion = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var queued = new QueuedReferralSend(referral, completion);

        if (!_sendQueue.Writer.TryWrite(queued))
        {
            throw new InvalidOperationException("Unable to enqueue referral message for send");
        }

        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var waitTask = completion.Task;
        var cancellationTask = Task.Delay(Timeout.InfiniteTimeSpan, linkedCts.Token);
        var finished = await Task.WhenAny(waitTask, cancellationTask);
        if (finished == waitTask)
        {
            linkedCts.Cancel();
            return await waitTask;
        }

        throw new OperationCanceledException("Referral send was canceled", cancellationToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping referral WebSocket background service");
        _sendQueue.Writer.TryComplete();
        await base.StopAsync(cancellationToken);
        await DisposeSocketAsync();
    }

    private async Task ProcessQueueOnceAsync(CancellationToken cancellationToken)
    {
        var message = await _sendQueue.Reader.ReadAsync(cancellationToken);
        await SendWithRetryAsync(message, cancellationToken);
    }

    private async Task SendWithRetryAsync(QueuedReferralSend queued, CancellationToken cancellationToken)
    {
        var maxAttempts = Math.Max(1, _options.MaxSendAttempts);
        Exception? lastException = null;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await EnsureConnectedAsync(cancellationToken);
                await SendAndAwaitAcknowledgementAsync(queued.Referral, cancellationToken);
                queued.Completion.TrySetResult(true);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                lastException = ex;
                _logger.LogWarning(ex,
                    "Referral send failed for {ReferralId}, retrying attempt {Attempt}/{MaxAttempts}",
                    queued.Referral.ReferralId, attempt + 1, maxAttempts);
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt - 1)), cancellationToken);
                await ReconnectAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                lastException = ex;
                break;
            }
        }

        queued.Completion.TrySetException(lastException ?? new InvalidOperationException("Referral send failed"));
    }

    private async Task SendAndAwaitAcknowledgementAsync(ReferralData referral, CancellationToken cancellationToken)
    {
        var socket = _socket;
        if (socket is null || socket.State != WebSocketState.Open)
        {
            throw new WebSocketException("WebSocket is not connected");
        }

        var eventPayload = new ReferralEventMessage
        {
            Event = "referral.created",
            Timestamp = DateTime.UtcNow,
            Source = _options.SourceSystem,
            Data = referral
        };

        var referralId = referral.ReferralId;
        var ackTcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        if (!_pendingAcks.TryAdd(referralId, ackTcs))
        {
            throw new InvalidOperationException($"Duplicate pending acknowledgement for referral {referralId}");
        }

        try
        {
            var payload = JsonSerializer.Serialize(eventPayload, _jsonOptions);
            var bytes = Encoding.UTF8.GetBytes(payload);
            await socket.SendAsync(bytes, WebSocketMessageType.Text, true, cancellationToken);
            _logger.LogInformation("Referral payload sent for {ReferralId}", referralId);

            using var ackTimeout = new CancellationTokenSource(
                TimeSpan.FromSeconds(_options.AcknowledgementTimeoutSeconds));
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, ackTimeout.Token);

            var completedTask = await Task.WhenAny(ackTcs.Task, Task.Delay(Timeout.InfiniteTimeSpan, linkedCts.Token));
            if (completedTask != ackTcs.Task)
            {
                throw new TimeoutException($"Acknowledgement timeout for referral {referralId}");
            }

            var acknowledged = await ackTcs.Task;
            if (!acknowledged)
            {
                throw new InvalidOperationException($"Server returned negative acknowledgement for referral {referralId}");
            }
        }
        finally
        {
            _pendingAcks.TryRemove(referralId, out _);
        }
    }

    private async Task EnsureConnectedAsync(CancellationToken cancellationToken)
    {
        if (_socket is { State: WebSocketState.Open })
        {
            return;
        }

        await _connectionGate.WaitAsync(cancellationToken);
        try
        {
            if (_socket is { State: WebSocketState.Open })
            {
                return;
            }

            var delaySeconds = Math.Max(1, _options.InitialReconnectDelaySeconds);
            var maxDelaySeconds = Math.Max(delaySeconds, _options.MaxReconnectDelaySeconds);

            while (!cancellationToken.IsCancellationRequested)
            {
                await DisposeSocketAsync();
                _socket = CreateWebSocket();

                try
                {
                    var endpoint = new Uri(_options.EndpointUrl);
                    _logger.LogInformation("Connecting referral WebSocket to {Endpoint}", endpoint);
                    await _socket.ConnectAsync(endpoint, cancellationToken);
                    _logger.LogInformation("Referral WebSocket connected");

                    _receiveLoopTask = RunReceiveLoopAsync(_socket, cancellationToken);
                    _heartbeatTask = RunHeartbeatLoopAsync(_socket, cancellationToken);
                    return;
                }
                catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
                {
                    _logger.LogWarning(ex,
                        "Referral WebSocket connection failed, retrying in {DelaySeconds}s",
                        delaySeconds);
                    await Task.Delay(TimeSpan.FromSeconds(delaySeconds), cancellationToken);
                    delaySeconds = Math.Min(delaySeconds * 2, maxDelaySeconds);
                }
            }
        }
        finally
        {
            _connectionGate.Release();
        }
    }

    private async Task ReconnectAsync(CancellationToken cancellationToken)
    {
        await DisposeSocketAsync();
        await EnsureConnectedAsync(cancellationToken);
    }

    private ClientWebSocket CreateWebSocket()
    {
        var socket = new ClientWebSocket();

        if (!string.IsNullOrWhiteSpace(_options.JwtToken))
        {
            socket.Options.SetRequestHeader("Authorization", $"Bearer {_options.JwtToken}");
        }
        else if (!string.IsNullOrWhiteSpace(_options.JwtTokenFilePath) && File.Exists(_options.JwtTokenFilePath))
        {
            var tokenFromFile = File.ReadAllText(_options.JwtTokenFilePath).Trim();
            if (!string.IsNullOrWhiteSpace(tokenFromFile))
            {
                socket.Options.SetRequestHeader("Authorization", $"Bearer {tokenFromFile}");
            }
        }

        if (!string.IsNullOrWhiteSpace(_options.ClientCertificatePath) && File.Exists(_options.ClientCertificatePath))
        {
            var cert = new X509Certificate2(_options.ClientCertificatePath, _options.ClientCertificatePassword);
            socket.Options.ClientCertificates ??= new X509CertificateCollection();
            socket.Options.ClientCertificates.Add(cert);
        }

        return socket;
    }

    private async Task RunReceiveLoopAsync(ClientWebSocket socket, CancellationToken cancellationToken)
    {
        var buffer = new byte[4096];

        while (!cancellationToken.IsCancellationRequested && socket.State == WebSocketState.Open)
        {
            try
            {
                using var ms = new MemoryStream();
                WebSocketReceiveResult result;
                do
                {
                    result = await socket.ReceiveAsync(buffer, cancellationToken);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        _logger.LogWarning("Referral WebSocket closed by server: {Status} {Description}",
                            result.CloseStatus, result.CloseStatusDescription);
                        await ReconnectAsync(cancellationToken);
                        return;
                    }

                    ms.Write(buffer, 0, result.Count);
                } while (!result.EndOfMessage);

                var message = Encoding.UTF8.GetString(ms.ToArray());
                HandleIncomingMessage(message);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in referral WebSocket receive loop");
                await ReconnectAsync(cancellationToken);
                return;
            }
        }
    }

    private async Task RunHeartbeatLoopAsync(ClientWebSocket socket, CancellationToken cancellationToken)
    {
        var interval = TimeSpan.FromSeconds(Math.Max(1, _options.HeartbeatIntervalSeconds));

        while (!cancellationToken.IsCancellationRequested && socket.State == WebSocketState.Open)
        {
            try
            {
                await Task.Delay(interval, cancellationToken);
                if (socket.State != WebSocketState.Open)
                {
                    break;
                }

                var heartbeatJson = JsonSerializer.Serialize(new
                {
                    @event = "ping",
                    timestamp = DateTime.UtcNow,
                    source = _options.SourceSystem
                });
                var bytes = Encoding.UTF8.GetBytes(heartbeatJson);
                await socket.SendAsync(bytes, WebSocketMessageType.Text, true, cancellationToken);
                _logger.LogDebug("Referral WebSocket heartbeat sent");
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send heartbeat, reconnecting referral WebSocket");
                await ReconnectAsync(cancellationToken);
                return;
            }
        }
    }

    private void HandleIncomingMessage(string message)
    {
        try
        {
            using var doc = JsonDocument.Parse(message);
            var root = doc.RootElement;

            if (!TryExtractReferralId(root, out var referralId) || string.IsNullOrWhiteSpace(referralId))
            {
                _logger.LogDebug("Received non-ack WebSocket message: {Message}", message);
                return;
            }

            var isSuccess = TryExtractSuccess(root, out var ackSuccess) && ackSuccess;
            if (_pendingAcks.TryGetValue(referralId, out var tcs))
            {
                tcs.TrySetResult(isSuccess);
                _logger.LogInformation("Acknowledgement received for referral {ReferralId}, success={Success}",
                    referralId, isSuccess);
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Invalid JSON response received from referral WebSocket");
        }
    }

    private static bool TryExtractReferralId(JsonElement root, out string referralId)
    {
        referralId = string.Empty;

        if (root.TryGetProperty("referral_id", out var referralElement) &&
            referralElement.ValueKind == JsonValueKind.String)
        {
            referralId = referralElement.GetString() ?? string.Empty;
            return true;
        }

        if (root.TryGetProperty("data", out var dataElement) &&
            dataElement.ValueKind == JsonValueKind.Object &&
            dataElement.TryGetProperty("referral_id", out var nestedReferralElement) &&
            nestedReferralElement.ValueKind == JsonValueKind.String)
        {
            referralId = nestedReferralElement.GetString() ?? string.Empty;
            return true;
        }

        return false;
    }

    private static bool TryExtractSuccess(JsonElement root, out bool success)
    {
        success = false;

        if (root.TryGetProperty("success", out var successElement) &&
            successElement.ValueKind is JsonValueKind.True or JsonValueKind.False)
        {
            success = successElement.GetBoolean();
            return true;
        }

        if (root.TryGetProperty("status", out var statusElement) && statusElement.ValueKind == JsonValueKind.String)
        {
            var status = statusElement.GetString();
            success = string.Equals(status, "ok", StringComparison.OrdinalIgnoreCase) ||
                      string.Equals(status, "accepted", StringComparison.OrdinalIgnoreCase) ||
                      string.Equals(status, "success", StringComparison.OrdinalIgnoreCase);
            return true;
        }

        if (root.TryGetProperty("data", out var dataElement) &&
            dataElement.ValueKind == JsonValueKind.Object &&
            dataElement.TryGetProperty("success", out var nestedSuccessElement) &&
            nestedSuccessElement.ValueKind is JsonValueKind.True or JsonValueKind.False)
        {
            success = nestedSuccessElement.GetBoolean();
            return true;
        }

        return false;
    }

    private async Task DisposeSocketAsync()
    {
        var socket = Interlocked.Exchange(ref _socket, null);
        if (socket is null)
        {
            return;
        }

        try
        {
            if (socket.State == WebSocketState.Open)
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "client-disconnect", CancellationToken.None);
            }
        }
        catch
        {
            // Ignore close exceptions during reconnect/shutdown.
        }
        finally
        {
            socket.Dispose();
        }
    }

    private sealed record QueuedReferralSend(ReferralData Referral, TaskCompletionSource<bool> Completion);
}
