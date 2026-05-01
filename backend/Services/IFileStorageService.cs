namespace CLINICSYSTEM.Services;

/// <summary>
/// Interface for file storage service
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Save file to storage
    /// </summary>
    Task<string> SaveFileAsync(Stream fileStream, string filename, string folderPath);

    /// <summary>
    /// Delete file from storage
    /// </summary>
    Task<bool> DeleteFileAsync(string filePath);

    /// <summary>
    /// Get file as stream
    /// </summary>
    Task<Stream?> GetFileStreamAsync(string filePath);

    /// <summary>
    /// Check if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string filePath);

    /// <summary>
    /// Get file size
    /// </summary>
    Task<long> GetFileSizeAsync(string filePath);

    /// <summary>
    /// Save medical image
    /// </summary>
    Task<string> SaveMedicalImageAsync(Stream fileStream, string filename);

    /// <summary>
    /// Save prescription PDF
    /// </summary>
    Task<string> SavePrescriptionPdfAsync(byte[] pdfBytes, string filename);

    /// <summary>
    /// Get file URL
    /// </summary>
    string GetFileUrl(string filePath);
}
