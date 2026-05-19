namespace CLINICSYSTEM.Constants;

/// <summary>
/// Roles accepted by POST /api/Auth/register.
/// </summary>
public static class RegistrationRoles
{
    public const string Doctor = "Doctor";
    public const string Nurse = "Nurse";
    public const string Admin = "Admin";
    public const string Staff = "Staff";
    public const string Patient = "Patient";
    public const string Radiologist = "Radiologist";
    public const string Physiotherapist = "Physiotherapist";

    public static readonly string[] All =
    {
        Doctor, Nurse, Admin, Staff, Patient, Radiologist, Physiotherapist
    };

    public const string Pattern = "^(Doctor|Nurse|Admin|Staff|Patient|Radiologist|Physiotherapist)$";

    public const string AllowedRolesMessage =
        "Role must be 'Doctor', 'Nurse', 'Admin', 'Staff', 'Patient', 'Radiologist', or 'Physiotherapist'";

    public static bool IsValid(string? role) =>
        !string.IsNullOrWhiteSpace(role) && All.Contains(role, StringComparer.Ordinal);
}
