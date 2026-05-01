using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for creating notifications
/// </summary>
public class CreateNotificationDtoValidator : AbstractValidator<CreateNotificationDto>
{
    public CreateNotificationDtoValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .GreaterThan(0).WithMessage(ValidationMessages.IdInvalid);

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage(ValidationMessages.MessageRequired)
            .Length(1, 1000).WithMessage(ValidationMessages.MessageLength);

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage(ValidationMessages.NotificationTypeRequired);
    }
}
