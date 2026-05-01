using System.Net.Http.Json;
using System.Text;
using CLINICSYSTEM.Helpers;

namespace CLINICSYSTEM.Services;

/// <summary>
/// SMS service implementation
/// Supports multiple SMS providers: Twilio, Nexmo/Vonage, custom HTTP API
/// Handles SMS notifications for appointments, verification codes, and reminders
/// </summary>
public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public SmsService(ILogger<SmsService> logger, IConfiguration configuration, HttpClient httpClient)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClient;
    }

    /// <summary>
    /// Send SMS to a phone number
    /// Validates phone number, normalizes format, and routes to appropriate provider
    /// </summary>
    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        try
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(phoneNumber) || string.IsNullOrWhiteSpace(message))
            {
                _logger.LogWarning("Invalid SMS input: phone={PhoneNumber}, message length={MessageLength}", 
                    string.IsNullOrEmpty(phoneNumber) ? "empty" : phoneNumber.Length.ToString(), 
                    message?.Length ?? 0);
                return false;
            }

            // Validate phone number format (Egyptian format: +20 or 0 followed by 1XXXXXXXXX)
            if (!IsValidEgyptianPhoneNumber(phoneNumber))
            {
                _logger.LogWarning("Invalid phone number format: {PhoneNumber}", phoneNumber);
                return false;
            }

            // Get SMS provider settings
            var smsSettings = _configuration.GetSection("SmsSettings");
            var provider = smsSettings["Provider"] ?? "Mock"; // Default to Mock
            var isEnabled = bool.TryParse(smsSettings["Enabled"], out var enabled) && enabled;

            if (!isEnabled)
            {
                _logger.LogInformation("SMS service is disabled. Message would be sent to: {PhoneNumber}", phoneNumber);
                return true;
            }

            // Normalize phone number to international format
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);

            // Log SMS segment count
            var segmentCount = SmsTemplateHelper.CalculateSmsSegments(message);
            _logger.LogInformation("Sending SMS ({SegmentCount} segment(s)) to {PhoneNumber} via {Provider}", 
                segmentCount, normalizedPhone, provider);

            // Route to appropriate provider
            return provider.ToLower() switch
            {
                "twilio" => await SendViaTwilioAsync(normalizedPhone, message, smsSettings),
                "nexmo" => await SendViaNexmoAsync(normalizedPhone, message, smsSettings),
                "http" => await SendViaHttpAsync(normalizedPhone, message, smsSettings),
                "mock" => await SendViaMockAsync(normalizedPhone, message),
                _ => await SendViaMockAsync(normalizedPhone, message)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    /// <summary>
    /// Send appointment reminder SMS
    /// </summary>
    public async Task<bool> SendAppointmentReminderSmsAsync(string phoneNumber, string patientName, DateTime appointmentDate, string timeSlot)
    {
        try
        {
            var appointmentDateFormatted = appointmentDate.ToString("dd/MM/yyyy");
            var message = SmsTemplateHelper.GetAppointmentReminderSms(patientName, appointmentDateFormatted, timeSlot);
            
            var success = await SendSmsAsync(phoneNumber, message);
            
            if (success)
            {
                _logger.LogInformation("Appointment reminder SMS sent to {PhoneNumber} for patient {PatientName} on {AppointmentDate}", 
                    phoneNumber, patientName, appointmentDateFormatted);
            }
            
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send appointment reminder SMS to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    /// <summary>
    /// Send verification code SMS
    /// </summary>
    public async Task<bool> SendVerificationCodeAsync(string phoneNumber, string code)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                _logger.LogWarning("Verification code is empty for {PhoneNumber}", phoneNumber);
                return false;
            }

            var message = SmsTemplateHelper.GetVerificationCodeSms(code);
            
            var success = await SendSmsAsync(phoneNumber, message);
            
            if (success)
            {
                _logger.LogInformation("Verification code SMS sent to {PhoneNumber}", phoneNumber);
            }
            
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification code SMS to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    /// <summary>
    /// Send appointment confirmation SMS
    /// </summary>
    public async Task<bool> SendAppointmentConfirmationSmsAsync(string phoneNumber, string doctorName, DateTime appointmentDate, string timeSlot)
    {
        try
        {
            var appointmentDateFormatted = appointmentDate.ToString("dd/MM/yyyy");
            var message = SmsTemplateHelper.GetAppointmentConfirmationSms(doctorName, appointmentDateFormatted, timeSlot);
            
            var success = await SendSmsAsync(phoneNumber, message);
            
            if (success)
            {
                _logger.LogInformation("Appointment confirmation SMS sent to {PhoneNumber} for appointment with Dr. {DoctorName} on {AppointmentDate}", 
                    phoneNumber, doctorName, appointmentDateFormatted);
            }
            
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send appointment confirmation SMS to {PhoneNumber}", phoneNumber);
            return false;
        }
    }

    /// <summary>
    /// Send SMS via Twilio API
    /// Requires: AccountSid, AuthToken, FromPhoneNumber in SmsSettings
    /// </summary>
    private async Task<bool> SendViaTwilioAsync(string toPhoneNumber, string message, IConfigurationSection smsSettings)
    {
        try
        {
            var accountSid = smsSettings["AccountSid"];
            var authToken = smsSettings["AuthToken"];
            var fromPhoneNumber = smsSettings["FromPhoneNumber"];

            if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(fromPhoneNumber))
            {
                _logger.LogWarning("Twilio credentials not configured");
                return false;
            }

            // Twilio API endpoint
            var url = $"https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";

            // Create request body
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("From", fromPhoneNumber),
                new KeyValuePair<string, string>("To", toPhoneNumber),
                new KeyValuePair<string, string>("Body", message)
            });

            // Add Twilio authentication (Basic Auth)
            var authString = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{accountSid}:{authToken}"));
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authString);

            // Send request
            var response = await _httpClient.PostAsync(url, content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS sent successfully via Twilio to {PhoneNumber}", toPhoneNumber);
                return true;
            }
            else
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Twilio API error: {StatusCode} - {Response}", response.StatusCode, responseContent);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS via Twilio");
            return false;
        }
    }

    /// <summary>
    /// Send SMS via Nexmo (Vonage) API
    /// Requires: ApiKey, ApiSecret, FromName in SmsSettings
    /// </summary>
    private async Task<bool> SendViaNexmoAsync(string toPhoneNumber, string message, IConfigurationSection smsSettings)
    {
        try
        {
            var apiKey = smsSettings["ApiKey"];
            var apiSecret = smsSettings["ApiSecret"];
            var fromName = smsSettings["FromName"] ?? "Clinic";

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                _logger.LogWarning("Nexmo credentials not configured");
                return false;
            }

            // Nexmo API endpoint
            var url = "https://rest.nexmo.com/sms/json";

            var payload = new
            {
                api_key = apiKey,
                api_secret = apiSecret,
                to = toPhoneNumber,
                from = fromName,
                text = message
            };

            var response = await _httpClient.PostAsJsonAsync(url, payload);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS sent successfully via Nexmo to {PhoneNumber}", toPhoneNumber);
                return true;
            }
            else
            {
                _logger.LogError("Nexmo API error: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS via Nexmo");
            return false;
        }
    }

    /// <summary>
    /// Send SMS via custom HTTP API (fallback for custom SMS providers)
    /// </summary>
    private async Task<bool> SendViaHttpAsync(string phoneNumber, string message, IConfigurationSection smsSettings)
    {
        try
        {
            var apiUrl = smsSettings["ApiUrl"];
            var apiKey = smsSettings["ApiKey"];

            if (string.IsNullOrEmpty(apiUrl))
            {
                _logger.LogWarning("SMS API URL not configured");
                return false;
            }

            var payload = new
            {
                phoneNumber = phoneNumber,
                message = message,
                apiKey = apiKey
            };

            var response = await _httpClient.PostAsJsonAsync(apiUrl, payload);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS sent successfully via HTTP API to {PhoneNumber}", phoneNumber);
                return true;
            }
            else
            {
                _logger.LogError("HTTP API error: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS via HTTP API");
            return false;
        }
    }

    /// <summary>
    /// Mock SMS sending - logs the SMS instead of actually sending
    /// Useful for development and testing
    /// </summary>
    private async Task<bool> SendViaMockAsync(string phoneNumber, string message)
    {
        try
        {
            _logger.LogInformation("MOCK SMS: To={PhoneNumber}, Message={Message}", phoneNumber, message);
            
            var segmentCount = SmsTemplateHelper.CalculateSmsSegments(message);
            _logger.LogInformation("Message would be sent in {SegmentCount} segment(s)", segmentCount);
            
            await Task.Delay(100); // Simulate async operation
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in mock SMS sending");
            return false;
        }
    }

    /// <summary>
    /// Validate Egyptian phone number format
    /// Egyptian numbers: +20 1XX XXXX XXXX or 01XX XXXX XXXX
    /// Supports Vodafone (1), Etisalat (0), Orange (2), WeEgypt (0)
    /// </summary>
    private bool IsValidEgyptianPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        // Pattern: +20 followed by 1 and 10 digits, or 0 followed by 1 and 10 digits
        // Egyptian carriers: 010, 011, 012, 015, 016, 017, 018, 019, 020
        var pattern = @"^(\+20|0)?1[0-2,5-9]\d{8}$";
        return System.Text.RegularExpressions.Regex.IsMatch(phoneNumber, pattern);
    }

    /// <summary>
    /// Normalize phone number to international format (+20XXXXXXXXXX)
    /// Handles multiple input formats
    /// </summary>
    private string NormalizePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return phoneNumber;

        // Remove spaces, dashes, parentheses, and plus signs for processing
        phoneNumber = System.Text.RegularExpressions.Regex.Replace(phoneNumber, @"[\s\-\(\)\+]", "");

        // If starts with 0, replace with 20 (Egypt country code)
        if (phoneNumber.StartsWith("0"))
            phoneNumber = "20" + phoneNumber.Substring(1);

        // Ensure it starts with +20
        if (!phoneNumber.StartsWith("20"))
            phoneNumber = "20" + phoneNumber;

        return "+" + phoneNumber;
    }
}
