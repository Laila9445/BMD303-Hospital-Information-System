using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CLINICSYSTEM.Data.DTOs;

public class ReferralData
{
    [Required]
    [JsonPropertyName("referral_id")]
    public string ReferralId { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("patient")]
    public ReferralPatient Patient { get; set; } = new();

    [Required]
    [StringLength(200)]
    [JsonPropertyName("referring_doctor")]
    public string ReferringDoctor { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    [JsonPropertyName("service_requested")]
    public string ServiceRequested { get; set; } = string.Empty;

    [StringLength(2000)]
    [JsonPropertyName("doctor_notes")]
    public string? DoctorNotes { get; set; }

    [Required]
    [RegularExpression("routine|urgent|stat", ErrorMessage = "Priority must be routine, urgent, or stat")]
    [JsonPropertyName("priority")]
    public string Priority { get; set; } = "routine";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ReferralPatient
{
    [Required]
    [StringLength(200)]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Phone]
    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [EmailAddress]
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("date_of_birth")]
    public DateOnly? DateOfBirth { get; set; }
}

public class ReferralEventMessage
{
    [Required]
    [JsonPropertyName("event")]
    public string Event { get; set; } = "referral.created";

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    [JsonPropertyName("source")]
    public string Source { get; set; } = "dotnet-system";

    [Required]
    [JsonPropertyName("data")]
    public ReferralData Data { get; set; } = new();
}
