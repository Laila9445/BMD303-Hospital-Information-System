namespace CLINICSYSTEM.Data.DTOs
{
    public class MedicalHistoryDTO
    {
        public int UserId { get; set; }

        public string? Allergies { get; set; }

        public string? ChronicConditions { get; set; }

        public string? CurrentMedications { get; set; }

        public string? BloodType { get; set; }

        public string? SurgicalHistory { get; set; }

        public string? FamilyHistory { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}