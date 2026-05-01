using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
    public class BookAppointmentRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Valid doctor ID is required")]
        public int DoctorId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Valid time slot ID is required")]
        public int TimeSlotId { get; set; }

        [StringLength(500)]
        public string? ReasonForVisit { get; set; }
    }

    public class CreateAppointmentDto
    {
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public int TimeSlotId { get; set; }
        public string? Reason { get; set; }
    }

    public class RescheduleAppointmentDto
    {
        public DateTime NewAppointmentDate { get; set; }
        public int NewTimeSlotId { get; set; }
    }

    public class AppointmentDTO
    {
        public int AppointmentId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReasonForVisit { get; set; }
    }

    public class RescheduleAppointmentRequest
    {
        public int AppointmentId { get; set; }
        public int NewTimeSlotId { get; set; }
    }

    public class CancelAppointmentRequest
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        [StringLength(500)]
        public string CancellationReason { get; set; } = string.Empty;
    }

    public class TimeSlotDTO
    {
        public int TimeSlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class AvailableTimeSlotsRequest
    {
        public int DoctorId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
