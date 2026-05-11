using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Services;

public class ReferralWebSocketOptions
{
    public const string SectionName = "ReferralWebSocket";

    [Required]
    public string EndpointUrl { get; set; } = "ws://localhost:8000/ws/referrals";

    public string? JwtToken { get; set; }

    public string? JwtTokenFilePath { get; set; }

    public string? ClientCertificatePath { get; set; }

    public string? ClientCertificatePassword { get; set; }

    [Range(1, 300)]
    public int HeartbeatIntervalSeconds { get; set; } = 30;

    [Range(1, 60)]
    public int AcknowledgementTimeoutSeconds { get; set; } = 5;

    [Range(1, 10)]
    public int MaxSendAttempts { get; set; } = 3;

    [Range(1, 60)]
    public int InitialReconnectDelaySeconds { get; set; } = 2;

    [Range(1, 60)]
    public int MaxReconnectDelaySeconds { get; set; } = 30;

    [Required]
    public string SourceSystem { get; set; } = "dotnet-system";
}
