using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IPatientPortalService
    {
        Task<PatientProfileDTO?> GetPatientProfileAsync(int userId);
        Task<bool> UpdatePatientProfileAsync(int userId, UpdatePatientProfileRequest request);
        Task<MedicalHistoryDTO?> GetMedicalHistoryAsync(int userId);
        Task<bool> UpdateMedicalHistoryAsync(int userId, UpdateMedicalHistoryRequest request);
        Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int userId);
        Task<List<PatientPrescriptionDTO>> GetPatientPrescriptionsAsync(int userId);
        Task<MedicalImageDTO?> UploadMedicalImageAsync(int userId, UploadMedicalImageRequest request);
        Task<List<MedicalImageDTO>> GetMedicalImagesAsync(int userId);
    }
}
