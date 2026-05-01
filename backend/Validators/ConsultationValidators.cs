using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for creating consultations
/// </summary>
public class CreateConsultationDtoValidator : AbstractValidator<CreateConsultationDto>
{
    public CreateConsultationDtoValidator()
    {
        RuleFor(x => x.AppointmentId)
            .NotEmpty()
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);

        RuleFor(x => x.Symptoms)
            .MaximumLength(2000).WithMessage(ValidationMessages.SymptomsLength);

        RuleFor(x => x.Diagnosis)
            .MaximumLength(2000).WithMessage(ValidationMessages.DiagnosisLength);

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage(ValidationMessages.NotesLength);
    }
}

/// <summary>
/// Validator for updating consultations
/// </summary>
public class UpdateConsultationDtoValidator : AbstractValidator<UpdateConsultationDto>
{
    public UpdateConsultationDtoValidator()
    {
        RuleFor(x => x.Symptoms)
            .MaximumLength(2000).When(x => !string.IsNullOrEmpty(x.Symptoms))
            .WithMessage(ValidationMessages.SymptomsLength);

        RuleFor(x => x.Diagnosis)
            .MaximumLength(2000).When(x => !string.IsNullOrEmpty(x.Diagnosis))
            .WithMessage(ValidationMessages.DiagnosisLength);

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage(ValidationMessages.NotesLength);

        RuleFor(x => x.Status)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Status))
            .WithMessage("Status cannot exceed 50 characters.");
    }
}
