namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Medical records for clinic consultations
    /// Note: Basic patient medical history is managed by Patient Portal
    /// This stores only consultation-specific medical records
    /// </summary>
    public class MedicalRecordModel
    {
        public int RecordId { get; set; }
        
        /// <summary>
        /// Optional internal patient reference (backward compatibility)
        /// Use PatientExternalId for new implementations
        /// </summary>
        public int? PatientId { get; set; }
        
        /// <summary>
        /// External Patient ID from Patient Portal system
        /// </summary>
        public string? PatientExternalId { get; set; }
        
        public int? ConsultationId { get; set; }
        public string? Allergies { get; set; }
        public string? ChronicConditions { get; set; }
        public string? CurrentMedications { get; set; }
        public string? SurgicalHistory { get; set; }
        public string? FamilyHistory { get; set; }
        public DateTime LastUpdated { get; set; }

        // Navigation properties
        public PatientModel? Patient { get; set; }
        public ConsultationModel? Consultation { get; set; }
    }
}
