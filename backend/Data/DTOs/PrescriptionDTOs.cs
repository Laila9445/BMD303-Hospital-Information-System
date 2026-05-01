using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
    public class CreatePrescriptionDto
    {
        public int ConsultationId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
        public string? Warnings { get; set; }
    }

    public class PrescriptionListDto
    {
        public int ConsultationId { get; set; }
        public List<CreatePrescriptionDto> Prescriptions { get; set; } = new();
    }

    public class CreatePrescriptionRequest
    {
        [Required]
        public int ConsultationId { get; set; }

        [Required]
        [StringLength(200)]
        public string MedicationName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Dosage { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Frequency { get; set; } = string.Empty;

        [Required]
        [Range(1, 365, ErrorMessage = "Duration must be between 1 and 365 days")]
        public int DurationDays { get; set; }

        [StringLength(1000)]
        public string? Instructions { get; set; }

        [StringLength(1000)]
        public string? Warnings { get; set; }
    }

    public class PrescriptionDTO
    {
        public int PrescriptionId { get; set; }
        public int ConsultationId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
        public string? Warnings { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class BulkPrescriptionRequest
    {
        public int ConsultationId { get; set; }
        public List<CreatePrescriptionRequest> Prescriptions { get; set; } = new();
    }

    public class PatientPrescriptionDTO
    {
        public int PrescriptionId { get; set; }
        public DateTime DateIssued { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class GeneratePrescriptionPdfRequest
    {
        public int PrescriptionId { get; set; }
    }
}
