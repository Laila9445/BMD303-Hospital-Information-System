using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IAppointmentService
    {
        Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(int doctorId, DateTime startDate, DateTime endDate);
        Task<AppointmentDTO?> BookAppointmentAsync(int patientId, BookAppointmentRequest request);
        Task<bool> RescheduleAppointmentAsync(int patientId, RescheduleAppointmentRequest request);
        Task<bool> CancelAppointmentAsync(int patientId, CancelAppointmentRequest request);
        Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int patientId);
        Task<AppointmentDTO?> GetAppointmentDetailsAsync(int appointmentId);
    }
}
