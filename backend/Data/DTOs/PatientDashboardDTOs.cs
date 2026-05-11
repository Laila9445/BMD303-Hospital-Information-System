using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
    public class PatientDashboardStatsDTO
    {
        public int UpcomingAppointments { get; set; }
        public int TotalVisits { get; set; }
        public int ActivePrescriptions { get; set; }
        public List<AppointmentDTO> RecentAppointments { get; set; } = new();
        public List<PatientPrescriptionDTO> RecentPrescriptions { get; set; } = new();
    }

    public class PatientPrescriptionDTO
    {
        public int PrescriptionId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
        public DateTime PrescribedDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public string DoctorName { get; set; } = string.Empty;
    }
}
