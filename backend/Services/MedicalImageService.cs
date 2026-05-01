using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class MedicalImageService : IMedicalImageService
    {
        private readonly ClinicDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;

        public MedicalImageService(ClinicDbContext context, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
        }

        public async Task<MedicalImageDTO?> UploadImageAsync(int patientId, UploadMedicalImageRequest request)
        {
            var uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath, "uploads", "medical-images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var image = new MedicalImageModel
            {
                PatientId = patientId,
                ImageType = request.ImageType,
                FileName = fileName,
                FilePath = Path.Combine("uploads", "medical-images", fileName),
                FileSizeBytes = request.File.Length,
                DateUploaded = DateTime.UtcNow,
                Description = request.Description
            };

            _context.MedicalImages.Add(image);
            await _context.SaveChangesAsync();

            return new MedicalImageDTO
            {
                ImageId = image.ImageId,
                ImageType = image.ImageType,
                FileName = image.FileName,
                DateUploaded = image.DateUploaded,
                FileSizeBytes = image.FileSizeBytes,
                Description = image.Description
            };
        }

        public async Task<List<MedicalImageDTO>> GetPatientImagesAsync(int patientId)
        {
            return await _context.MedicalImages
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.DateUploaded)
                .Select(m => new MedicalImageDTO
                {
                    ImageId = m.ImageId,
                    ImageType = m.ImageType,
                    FileName = m.FileName,
                    DateUploaded = m.DateUploaded,
                    FileSizeBytes = m.FileSizeBytes,
                    Description = m.Description
                })
                .ToListAsync();
        }

        public async Task<byte[]?> DownloadImageAsync(int imageId)
        {
            var image = await _context.MedicalImages.FindAsync(imageId);
            if (image == null) return null;

            var filePath = Path.Combine(_hostEnvironment.WebRootPath, image.FilePath);
            if (!File.Exists(filePath)) return null;

            return await File.ReadAllBytesAsync(filePath);
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            var image = await _context.MedicalImages.FindAsync(imageId);
            if (image == null) return false;

            var filePath = Path.Combine(_hostEnvironment.WebRootPath, image.FilePath);
            if (File.Exists(filePath))
                File.Delete(filePath);

            _context.MedicalImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
