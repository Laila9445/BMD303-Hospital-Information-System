using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    public class PatientModel
    {
        [Key]
        public int PatientId { get; set; }

        // 🔥 REQUIRED for services + DB context
        public int UserId { get; set; }

        public string ExternalPatientId { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        // 🔥 ADD missing fields used in DTO/service
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Address { get; set; }

        public string? PhoneNumber { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public DateTime? ExternalIdSyncedAt { get; set; }

        // Navigation
        public ICollection<AppointmentModel>? Appointments { get; set; }
        public ICollection<MedicalRecordModel>? MedicalRecords { get; set; }
        public ICollection<MedicalImageModel>? MedicalImages { get; set; }
    }
}