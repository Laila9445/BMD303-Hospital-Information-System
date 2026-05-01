using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for creating prescriptions
/// </summary>
public class CreatePrescriptionDtoValidator : AbstractValidator<CreatePrescriptionDto>
{
    public CreatePrescriptionDtoValidator()
    {
        RuleFor(x => x.ConsultationId)
            .NotEmpty()
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);

        RuleFor(x => x.MedicationName)
            .NotEmpty().WithMessage(ValidationMessages.MedicationNameRequired)
            .Length(2, 200).WithMessage(ValidationMessages.MedicationNameLength);

        RuleFor(x => x.Dosage)
            .NotEmpty().WithMessage(ValidationMessages.DosageRequired)
            .Length(2, 100).WithMessage(ValidationMessages.DosageLength);

        RuleFor(x => x.Frequency)
            .NotEmpty().WithMessage(ValidationMessages.FrequencyRequired)
            .Length(2, 100).WithMessage(ValidationMessages.FrequencyLength);

        RuleFor(x => x.DurationDays)
            .NotEmpty().WithMessage(ValidationMessages.DurationRequired)
            .GreaterThan(0).WithMessage("Duration must be greater than 0 days");

        RuleFor(x => x.Instructions)
            .MaximumLength(1000).WithMessage(ValidationMessages.InstructionsLength);
    }
}

/// <summary>
/// Validator for prescription list (for creating multiple medications)
/// </summary>
public class PrescriptionListDtoValidator : AbstractValidator<PrescriptionListDto>
{
    public PrescriptionListDtoValidator()
    {
        RuleFor(x => x.Prescriptions)
            .NotEmpty().WithMessage("At least one medication is required.")
            .Must(m => m.Count <= 10).WithMessage("Maximum 10 medications allowed per prescription.");

        RuleForEach(x => x.Prescriptions)
            .SetValidator(new CreatePrescriptionDtoValidator());
    }
}
