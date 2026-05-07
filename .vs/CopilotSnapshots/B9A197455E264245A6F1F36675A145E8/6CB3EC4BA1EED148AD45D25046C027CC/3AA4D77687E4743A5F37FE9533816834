namespace CLINICSYSTEM.Models
{
    public class ConsultationModel
    {
        public int ConsultationId { get; set; }
        public int AppointmentId { get; set; }
        public DateTime ConsultationDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string Status { get; set; } = "In Progress"; // In Progress, Completed
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public AppointmentModel? Appointment { get; set; }
        public ICollection<PrescriptionModel>? Prescriptions { get; set; }
        public ICollection<MedicalRecordModel>? MedicalRecords { get; set; }
    }
}
