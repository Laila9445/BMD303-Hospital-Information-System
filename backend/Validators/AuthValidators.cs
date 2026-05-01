using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators;

/// <summary>
/// Validator for user registration
/// </summary>
public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage(ValidationMessages.EmailRequired)
            .EmailAddress().WithMessage(ValidationMessages.EmailInvalid)
            .MaximumLength(100);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(ValidationMessages.PasswordRequired)
            .MinimumLength(8).WithMessage(ValidationMessages.PasswordLength)
            .MaximumLength(100).WithMessage(ValidationMessages.PasswordLength)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage(ValidationMessages.NameRequired)
            .Length(2, 50).WithMessage(ValidationMessages.NameLength);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage(ValidationMessages.NameRequired)
            .Length(2, 50).WithMessage(ValidationMessages.NameLength);

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage(ValidationMessages.PhoneRequired)
            .Matches(@"^(\+20|0)?1[0125]\d{8}$").WithMessage(ValidationMessages.PhoneInvalid);

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => role == "Doctor" || role == "Patient")
            .WithMessage("Role must be either 'Doctor' or 'Patient'.");
    }
}

/// <summary>
/// Validator for user login
/// </summary>
public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage(ValidationMessages.EmailRequired)
            .EmailAddress().WithMessage(ValidationMessages.EmailInvalid);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(ValidationMessages.PasswordRequired);
    }
}
