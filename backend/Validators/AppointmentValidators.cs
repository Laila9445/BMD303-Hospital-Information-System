using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for creating appointments
/// </summary>
public class CreateAppointmentDtoValidator : AbstractValidator<CreateAppointmentDto>
{
    public CreateAppointmentDtoValidator()
    {
        RuleFor(x => x.DoctorId)
            .NotEmpty().WithMessage(ValidationMessages.DoctorIdRequired)
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);

        RuleFor(x => x.AppointmentDate)
            .NotEmpty().WithMessage(ValidationMessages.AppointmentDateRequired)
            .GreaterThan(DateTime.Now).WithMessage(ValidationMessages.AppointmentDateInvalid);

        RuleFor(x => x.TimeSlotId)
            .NotEmpty()
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage(ValidationMessages.ReasonLength);
    }
}

/// <summary>
/// Validator for rescheduling appointments
/// </summary>
public class RescheduleAppointmentDtoValidator : AbstractValidator<RescheduleAppointmentDto>
{
    public RescheduleAppointmentDtoValidator()
    {
        RuleFor(x => x.NewAppointmentDate)
            .NotEmpty().WithMessage(ValidationMessages.AppointmentDateRequired)
            .GreaterThan(DateTime.Now).WithMessage(ValidationMessages.AppointmentDateInvalid);

        RuleFor(x => x.NewTimeSlotId)
            .NotEmpty()
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);
    }
}
