using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for uploading medical images
/// </summary>
public class UploadMedicalImageDtoValidator : AbstractValidator<UploadMedicalImageDto>
{
    public UploadMedicalImageDtoValidator()
    {
        RuleFor(x => x.ImageType)
            .NotEmpty().WithMessage(ValidationMessages.ImageTypeRequired)
            .Length(2, 50).WithMessage(ValidationMessages.ImageTypeLength);

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage(ValidationMessages.DescriptionLength);

        RuleFor(x => x.File)
            .NotNull().WithMessage(ValidationMessages.FileRequired);
    }
}
