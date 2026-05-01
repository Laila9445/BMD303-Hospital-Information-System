namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Medical images for clinic system
    /// Note: Full radiology services managed by Radiology microservice
    /// This stores only basic diagnostic images used in clinic consultations
    /// </summary>
    public class MedicalImageModel
    {
        public int ImageId { get; set; }
        
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
        public string ImageType { get; set; } = string.Empty; // X-ray, MRI, CT, etc.
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime DateUploaded { get; set; }
        public string? Description { get; set; }
        
        /// <summary>
        /// Reference to external radiology system if image is stored there
        /// </summary>
        public string? ExternalRadiologyId { get; set; }

        // Navigation properties
        public PatientModel? Patient { get; set; }
        public ConsultationModel? Consultation { get; set; }
    }
}
