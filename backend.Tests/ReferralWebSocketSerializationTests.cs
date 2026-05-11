using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using CLINICSYSTEM.Data.DTOs;
using Xunit;

namespace CLINICSYSTEM.Tests;

public class ReferralWebSocketSerializationTests
{
    [Fact]
    public void ReferralData_WithInvalidPriority_FailsValidation()
    {
        var referral = new ReferralData
        {
            ReferralId = "REF-12345",
            ReferringDoctor = "Dr. Sarah Johnson",
            ServiceRequested = "Physical Therapy",
            Priority = "low",
            CreatedAt = DateTime.UtcNow,
            Patient = new ReferralPatient
            {
                Name = "John Doe",
                Email = "john@example.com",
                Phone = "+1234567890",
                DateOfBirth = new DateOnly(1985, 3, 15)
            }
        };

        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(referral, new ValidationContext(referral), results, true);

        Assert.False(valid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(ReferralData.Priority)));
    }

    [Fact]
    public void ReferralEventMessage_SerializesToExpectedJsonShape()
    {
        var now = new DateTime(2026, 5, 7, 10, 30, 0, DateTimeKind.Utc);
        var message = new ReferralEventMessage
        {
            Event = "referral.created",
            Timestamp = now,
            Source = "dotnet-system",
            Data = new ReferralData
            {
                ReferralId = "REF-12345",
                ReferringDoctor = "Dr. Sarah Johnson",
                ServiceRequested = "Physical Therapy",
                DoctorNotes = "Lower back pain, 2 months",
                Priority = "routine",
                CreatedAt = now,
                Patient = new ReferralPatient
                {
                    Name = "John Doe",
                    Phone = "+1234567890",
                    Email = "john@example.com",
                    DateOfBirth = new DateOnly(1985, 3, 15)
                }
            }
        };

        var json = JsonSerializer.Serialize(message);

        Assert.Contains("\"event\":\"referral.created\"", json);
        Assert.Contains("\"source\":\"dotnet-system\"", json);
        Assert.Contains("\"referral_id\":\"REF-12345\"", json);
        Assert.Contains("\"service_requested\":\"Physical Therapy\"", json);
        Assert.Contains("\"date_of_birth\":\"1985-03-15\"", json);
    }
}
