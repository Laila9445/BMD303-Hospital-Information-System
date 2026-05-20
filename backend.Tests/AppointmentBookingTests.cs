using System.ComponentModel.DataAnnotations;
using CLINICSYSTEM.Data.DTOs;
using Xunit;

namespace CLINICSYSTEM.Tests;

public class AppointmentBookingTests
{
    [Fact]
    public void BookAppointmentRequest_ValidPayload_PassesValidation()
    {
        var request = new BookAppointmentRequest
        {
            DoctorId = 1,
            PatientId = 5,
            TimeSlotId = 10,
            ReasonForVisit = "Follow-up",
            ReferralId = 3,
        };

        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(request, new ValidationContext(request), results, true);

        Assert.True(valid);
        Assert.Empty(results);
    }

    [Fact]
    public void BookAppointmentRequest_MissingTimeSlot_FailsValidation()
    {
        var request = new BookAppointmentRequest
        {
            DoctorId = 1,
            TimeSlotId = 0,
        };

        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(request, new ValidationContext(request), results, true);

        Assert.False(valid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(BookAppointmentRequest.TimeSlotId)));
    }
}
