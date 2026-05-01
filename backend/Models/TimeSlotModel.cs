namespace CLINICSYSTEM.Models
{
    public class TimeSlotModel
    {
        public int TimeSlotId { get; set; }
        public int ScheduleId { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; } = "Available"; // Available, Booked, Blocked
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public DoctorSchedule? Schedule { get; set; }
        public ICollection<AppointmentModel>? Appointments { get; set; }
    }
}
