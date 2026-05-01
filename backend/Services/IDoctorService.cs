using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IDoctorService
    {
        Task<int?> GetDoctorIdByUserIdAsync(int userId);
        Task<List<DoctorListDTO>> GetAllDoctorsAsync();
        Task<DoctorProfileDTO?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UpdateDoctorProfileRequest request);
        Task<List<DayAppointmentDTO>> GetTodayAppointmentsAsync(int doctorId);
        Task<List<DayAppointmentDTO>> GetAppointmentsAsync(int doctorId, DateTime date);
        Task<PatientRecordDetailDTO?> GetPatientRecordAsync(int patientId);
        Task<List<PatientSearchDTO>> SearchPatientsAsync(string searchTerm);
        Task<List<MedicalImageDTO>> GetPatientMedicalImagesAsync(int patientId);
        Task<bool> CreateScheduleAsync(int doctorId, CreateScheduleRequest request);
        Task<List<DoctorScheduleDTO>> GetSchedulesAsync(int doctorId);
        Task<bool> DeleteScheduleAsync(int scheduleId);
    }
}
