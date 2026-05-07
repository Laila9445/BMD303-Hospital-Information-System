namespace CLINICSYSTEM.Models
{
    public class DoctorSchedule
    {
        public int ScheduleId { get; set; }
        public int DoctorId { get; set; }
        public string DayOfWeek { get; set; } = string.Empty; // Monday, Tuesday, etc.
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int SlotDurationMinutes { get; set; } = 30;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public DoctorModel? Doctor { get; set; }
        public ICollection<TimeSlotModel>? TimeSlots { get; set; }
    }
}
