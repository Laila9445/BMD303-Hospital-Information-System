using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    public class AppointmentModel
    {
        [Key]
        public int AppointmentId { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public int TimeSlotId { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, Active, Completed, Cancelled
        public string? ReasonForVisit { get; set; }
        public DateTime BookedAt { get; set; }
        public DateTime? CanceledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public DoctorModel? Doctor { get; set; }
        public PatientModel? Patient { get; set; }
        public TimeSlotModel? TimeSlot { get; set; }
        public ConsultationModel? Consultation { get; set; }
    }
}
