using System;

namespace CLINICSYSTEM.Data.DTOs
{
    /// <summary>
    /// DTO for Nurse profile information
    /// </summary>
    public class NurseProfileDTO
    {
        public int NurseId { get; set; }
        public string UserId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Department { get; set; }
        public string? AvailableHours { get; set; }
        public DateTime HireDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating a nurse profile
    /// </summary>
    public class CreateNurseProfileRequest
    {
        public string UserId { get; set; } = null!;
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Department { get; set; }
        public string? AvailableHours { get; set; }
    }

    /// <summary>
    /// DTO for updating nurse profile
    /// </summary>
    public class UpdateNurseProfileRequest
    {
        public string? Specialization { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Department { get; set; }
        public string? AvailableHours { get; set; }
    }
}
