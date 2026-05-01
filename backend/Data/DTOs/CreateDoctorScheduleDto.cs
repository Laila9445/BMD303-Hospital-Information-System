namespace CLINICSYSTEM.Data.DTOs
{
    public class CreateDoctorScheduleDto
    {
        public string DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int SlotDurationMinutes { get; set; }
    }
}