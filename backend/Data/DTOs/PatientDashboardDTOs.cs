namespace CLINICSYSTEM.Data.DTOs
{
    public class PatientDashboardStatsDTO
    {
        public int TotalAppointments { get; set; }
        public int UpcomingAppointments { get; set; }
        public int TotalPrescriptions { get; set; }
        public int TotalMedicalImages { get; set; }
    }
}