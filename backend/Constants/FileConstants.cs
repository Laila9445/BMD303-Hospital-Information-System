namespace CLINICSYSTEM.Constants;

/// <summary>
/// File handling constants
/// </summary>
public static class FileConstants
{
    /// <summary>
    /// Allowed file extensions for medical images
    /// </summary>
    public static class AllowedExtensions
    {
        public static readonly string[] Images = { ".jpg", ".jpeg", ".png", ".dcm" };
        public static readonly string[] Documents = { ".pdf", ".doc", ".docx" };
        public static readonly string[] MedicalImages = { ".jpg", ".jpeg", ".png", ".dcm", ".dicom" };
    }

    /// <summary>
    /// Maximum file sizes in bytes
    /// </summary>
    public static class MaxFileSizes
    {
        public const long Image = 10 * 1024 * 1024; // 10 MB
        public const long Document = 5 * 1024 * 1024; // 5 MB
        public const long MedicalImage = 20 * 1024 * 1024; // 20 MB
    }

    /// <summary>
    /// File storage paths
    /// </summary>
    public static class StoragePaths
    {
        public const string UploadsFolder = "uploads";
        public const string MedicalImagesFolder = "uploads/medical-images";
        public const string PrescriptionsFolder = "uploads/prescriptions";
        public const string ProfilePicturesFolder = "uploads/profile-pictures";
        public const string TempFolder = "uploads/temp";
    }

    /// <summary>
    /// MIME types
    /// </summary>
    public static class MimeTypes
    {
        public const string Jpeg = "image/jpeg";
        public const string Png = "image/png";
        public const string Pdf = "application/pdf";
        public const string Dicom = "application/dicom";
        public const string OctetStream = "application/octet-stream";
    }
}
