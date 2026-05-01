using CLINICSYSTEM.Data.DTOs;
using FluentValidation;

namespace CLINICSYSTEM.Validators
{
    /// <summary>
    /// Validator for clinic user registration requests
    /// Validates Doctor, Nurse, Admin, and Staff registrations
    /// </summary>
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email must not exceed 100 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .MaximumLength(100).WithMessage("Password must not exceed 100 characters");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .Length(2, 50).WithMessage("First name must be between 2 and 50 characters")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("First name can only contain letters and spaces");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .Length(2, 50).WithMessage("Last name must be between 2 and 50 characters")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Last name can only contain letters and spaces");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^(\+20|0)?1[0125]\d{8}$").WithMessage("Invalid Egyptian phone number format");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required")
                .Must(role => role == "Doctor" || role == "Nurse" || role == "Admin" || role == "Staff")
                .WithMessage("Role must be 'Doctor', 'Nurse', 'Admin', or 'Staff'. Patient registration is handled by Patient Portal service.");

            // Doctor-specific validation
            RuleFor(x => x.Specialization)
                .NotEmpty().WithMessage("Specialization is required for doctors")
                .Length(2, 100).WithMessage("Specialization must be between 2 and 100 characters")
                .When(x => x.Role == "Doctor");

            RuleFor(x => x.LicenseNumber)
                .Length(5, 50).WithMessage("License number must be between 5 and 50 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.LicenseNumber) && x.Role == "Doctor");

            // Nurse-specific validation
            RuleFor(x => x.Department)
                .NotEmpty().WithMessage("Department is required for nurses")
                .Length(2, 100).WithMessage("Department must be between 2 and 100 characters")
                .When(x => x.Role == "Nurse");

            RuleFor(x => x.LicenseNumber)
                .Length(5, 50).WithMessage("License number must be between 5 and 50 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.LicenseNumber) && x.Role == "Nurse");
        }
    }

    /// <summary>
    /// Validator for user login requests
    /// </summary>
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }
}