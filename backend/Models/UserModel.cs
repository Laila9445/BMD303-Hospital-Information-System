using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// User model for Clinic System authentication
    /// Manages Doctor and Nurse users; Patients are managed by Patient Portal service
    /// </summary>
    public class UserModel : IdentityUser<int>
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        [Required]
        public string Role { get; set; } = string.Empty; // "Doctor", "Admin", "Staff", "Nurse"
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public DoctorModel? DoctorProfile { get; set; }
        public NurseModel? NurseProfile { get; set; }
    }
}

