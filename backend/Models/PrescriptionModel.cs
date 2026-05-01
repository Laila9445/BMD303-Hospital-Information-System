namespace CLINICSYSTEM.Models
{
    public class PrescriptionModel
    {
        public int PrescriptionId { get; set; }
        public int ConsultationId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty; // e.g., "Twice daily"
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
        public string? Warnings { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired
        public DateTime CreatedAt { get; set; }
        public DateTime? PdfGeneratedAt { get; set; }

        // Navigation properties
        public ConsultationModel? Consultation { get; set; }
    }
}
