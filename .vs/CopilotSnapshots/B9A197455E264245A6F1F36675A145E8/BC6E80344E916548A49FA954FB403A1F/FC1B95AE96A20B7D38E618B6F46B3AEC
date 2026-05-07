namespace CLINICSYSTEM.Models
{
    public class DoctorModel
    {
        public int DoctorId { get; set; }
        public int UserId { get; set; }
        public string Specialization { get; set; } = "Orthopedic Specialist";
        public string? LicenseNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public UserModel? User { get; set; }
        public ICollection<DoctorSchedule>? Schedules { get; set; }
        public ICollection<AppointmentModel>? Appointments { get; set; }
        public ICollection<ConsultationModel>? Consultations { get; set; }
    }
}
