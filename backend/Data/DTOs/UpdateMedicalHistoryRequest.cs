namespace CLINICSYSTEM.Data.DTOs
{
    public class UpdateMedicalHistoryRequest
    {
        public string? Allergies { get; set; }

        public string? ChronicConditions { get; set; }

        public string? CurrentMedications { get; set; }

        public string? BloodType { get; set; }

        public string? SurgicalHistory { get; set; }

        public string? FamilyHistory { get; set; }
    }
}