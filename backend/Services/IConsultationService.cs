using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IConsultationService
    {
        Task<ConsultationDTO?> StartConsultationAsync(int appointmentId);
        Task<bool> UpdateConsultationAsync(int consultationId, UpdateConsultationRequest request);
        Task<bool> EndConsultationAsync(int consultationId);
        Task<ConsultationDTO?> GetConsultationDetailsAsync(int consultationId);
        Task<List<PatientConsultationHistoryDTO>> GetPatientConsultationHistoryAsync(int patientId);
    }
}
