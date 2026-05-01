using System.ComponentModel.DataAnnotations;
using CLINICSYSTEM.Attributes;

namespace CLINICSYSTEM.Data.DTOs
{
    public class MedicalImageDTO
    {
        public int ImageId { get; set; }
        public string ImageType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public DateTime DateUploaded { get; set; }
        public long FileSizeBytes { get; set; }
        public string? Description { get; set; }
    }

    public class UploadMedicalImageDto
    {
        public IFormFile File { get; set; } = null!;
        public string ImageType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ConsultationId { get; set; }
    }

    public class UploadMedicalImageRequest
    {
        [Required(ErrorMessage = "File is required")]
        [MaxFileSize(10 * 1024 * 1024)] // 10MB
        [AllowedFileExtensions(".jpg", ".jpeg", ".png", ".pdf", ".dcm")]
        public IFormFile File { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string ImageType { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }
    }

    public class DeleteMedicalImageRequest
    {
        public int ImageId { get; set; }
    }
}
