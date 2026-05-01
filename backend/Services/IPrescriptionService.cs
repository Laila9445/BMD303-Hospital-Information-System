using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IPrescriptionService
    {
        Task<PrescriptionDTO?> CreatePrescriptionAsync(CreatePrescriptionRequest request);
        Task<List<PrescriptionDTO>> CreateBulkPrescriptionsAsync(BulkPrescriptionRequest request);
        Task<List<PatientPrescriptionDTO>> GetPatientPrescriptionsAsync(int patientId);
        Task<byte[]?> GeneratePrescriptionPdfAsync(int prescriptionId);
        Task<bool> SendPrescriptionToPatientAsync(int prescriptionId);
        Task<PrescriptionDTO?> GetPrescriptionDetailsAsync(int prescriptionId);
    }
}
