using System;
using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Medical imaging model for radiology integration
    /// </summary>
    public class MedicalImagingModel
    {
        [Key]
        public int ImagingId { get; set; }
        
        /// <summary>
        /// The referral this imaging is for
        /// </summary>
        public int ReferralId { get; set; }
        
        /// <summary>
        /// Navigation property to ReferralModel
        /// </summary>
        public ReferralModel? Referral { get; set; }
        
        /// <summary>
        /// Type of imaging (X-Ray, CT, MRI, Ultrasound, etc.)
        /// </summary>
        public string ImagingType { get; set; } = null!;
        
        /// <summary>
        /// Body part/area being imaged
        /// </summary>
        public string? BodyPart { get; set; }
        
        /// <summary>
        /// Date of imaging study
        /// </summary>
        public DateTime StudyDate { get; set; }
        
        /// <summary>
        /// Indication for imaging (clinical reason)
        /// </summary>
        public string? Indication { get; set; }
        
        /// <summary>
        /// Status (Pending, In Progress, Completed, Reviewed)
        /// </summary>
        public string Status { get; set; } = "Pending";
        
        /// <summary>
        /// Radiologist interpretation/report
        /// </summary>
        public string? RadiologyReport { get; set; }
        
        /// <summary>
        /// Radiologist name
        /// </summary>
        public string? RadiologistName { get; set; }
        
        /// <summary>
        /// File path or URL for the imaging file
        /// </summary>
        public string? FilePath { get; set; }
        
        /// <summary>
        /// File size in bytes
        /// </summary>
        public long? FileSize { get; set; }
        
        /// <summary>
        /// DICOM or other medical image format
        /// </summary>
        public string? FileFormat { get; set; }
        
        /// <summary>
        /// Date report was completed
        /// </summary>
        public DateTime? ReportDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
