using CLINICSYSTEM.Constants;

namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for file operations
/// </summary>
public static class FileHelper
{
    /// <summary>
    /// Get file extension from filename
    /// </summary>
    public static string GetFileExtension(string filename)
    {
        return Path.GetExtension(filename).ToLowerInvariant();
    }

    /// <summary>
    /// Check if file extension is allowed
    /// </summary>
    public static bool IsAllowedExtension(string filename, string[] allowedExtensions)
    {
        var extension = GetFileExtension(filename);
        return allowedExtensions.Contains(extension);
    }

    /// <summary>
    /// Check if file is an allowed image
    /// </summary>
    public static bool IsAllowedImage(string filename)
    {
        return IsAllowedExtension(filename, FileConstants.AllowedExtensions.Images);
    }

    /// <summary>
    /// Check if file is an allowed document
    /// </summary>
    public static bool IsAllowedDocument(string filename)
    {
        return IsAllowedExtension(filename, FileConstants.AllowedExtensions.Documents);
    }

    /// <summary>
    /// Check if file is an allowed medical image
    /// </summary>
    public static bool IsAllowedMedicalImage(string filename)
    {
        return IsAllowedExtension(filename, FileConstants.AllowedExtensions.MedicalImages);
    }

    /// <summary>
    /// Check if file size is within limit
    /// </summary>
    public static bool IsFileSizeValid(long fileSize, long maxSize)
    {
        return fileSize > 0 && fileSize <= maxSize;
    }

    /// <summary>
    /// Generate unique filename with timestamp
    /// </summary>
    public static string GenerateUniqueFileName(string originalFileName)
    {
        var extension = GetFileExtension(originalFileName);
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var guid = Guid.NewGuid().ToString("N").Substring(0, 8);
        
        return $"{fileNameWithoutExtension}_{timestamp}_{guid}{extension}";
    }

    /// <summary>
    /// Get MIME type from file extension
    /// </summary>
    public static string GetMimeType(string filename)
    {
        var extension = GetFileExtension(filename);
        
        return extension switch
        {
            ".jpg" or ".jpeg" => FileConstants.MimeTypes.Jpeg,
            ".png" => FileConstants.MimeTypes.Png,
            ".pdf" => FileConstants.MimeTypes.Pdf,
            ".dcm" or ".dicom" => FileConstants.MimeTypes.Dicom,
            _ => FileConstants.MimeTypes.OctetStream
        };
    }

    /// <summary>
    /// Ensure directory exists, create if it doesn't
    /// </summary>
    public static void EnsureDirectoryExists(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    /// <summary>
    /// Save file to disk
    /// </summary>
    public static async Task<string> SaveFileAsync(Stream fileStream, string filename, string folderPath)
    {
        EnsureDirectoryExists(folderPath);
        
        var uniqueFileName = GenerateUniqueFileName(filename);
        var filePath = Path.Combine(folderPath, uniqueFileName);
        
        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput);
        }
        
        return filePath;
    }

    /// <summary>
    /// Delete file from disk
    /// </summary>
    public static bool DeleteFile(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Get file size in bytes
    /// </summary>
    public static long GetFileSize(string filePath)
    {
        if (File.Exists(filePath))
        {
            var fileInfo = new FileInfo(filePath);
            return fileInfo.Length;
        }
        return 0;
    }

    /// <summary>
    /// Format file size to human-readable string
    /// </summary>
    public static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;
        
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        
        return $"{len:0.##} {sizes[order]}";
    }

    /// <summary>
    /// Validate file upload
    /// </summary>
    public static (bool IsValid, string ErrorMessage) ValidateFileUpload(
        string filename, 
        long fileSize, 
        string[] allowedExtensions, 
        long maxSize)
    {
        if (string.IsNullOrWhiteSpace(filename))
            return (false, "Filename is required.");

        if (!IsAllowedExtension(filename, allowedExtensions))
            return (false, $"File type not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");

        if (!IsFileSizeValid(fileSize, maxSize))
            return (false, $"File size exceeds maximum allowed size of {FormatFileSize(maxSize)}.");

        return (true, string.Empty);
    }
}
