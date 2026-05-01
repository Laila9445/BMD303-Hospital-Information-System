using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IMedicalImageService
    {
        Task<MedicalImageDTO?> UploadImageAsync(int patientId, UploadMedicalImageRequest request);
        Task<List<MedicalImageDTO>> GetPatientImagesAsync(int patientId);
        Task<byte[]?> DownloadImageAsync(int imageId);
        Task<bool> DeleteImageAsync(int imageId);
    }
}
