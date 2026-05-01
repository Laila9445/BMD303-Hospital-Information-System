namespace CLINICSYSTEM.Data.DTOs
{
    public class ConsultationDTO
    {
        public int ConsultationId { get; set; }
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime ConsultationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateConsultationDto
    {
        public int AppointmentId { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateConsultationDto
    {
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }

    public class StartConsultationRequest
    {
        public int AppointmentId { get; set; }
    }

    public class UpdateConsultationRequest
    {
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }

    public class EndConsultationRequest
    {
        public int ConsultationId { get; set; }
    }

    public class PatientConsultationHistoryDTO
    {
        public int ConsultationId { get; set; }
        public DateTime ConsultationDate { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }
}
