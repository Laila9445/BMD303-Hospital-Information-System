using CLINICSYSTEM.Constants;
using CLINICSYSTEM.Helpers;

namespace CLINICSYSTEM.Services;

/// <summary>
/// File storage service implementation for local file system
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly ILogger<FileStorageService> _logger;
    private readonly IWebHostEnvironment _environment;

    public FileStorageService(ILogger<FileStorageService> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string filename, string folderPath)
    {
        try
        {
            var fullPath = Path.Combine(_environment.ContentRootPath, folderPath);
            var filePath = await FileHelper.SaveFileAsync(fileStream, filename, fullPath);
            
            _logger.LogInformation("File saved successfully: {FilePath}", filePath);
            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save file: {Filename}", filename);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var result = FileHelper.DeleteFile(filePath);
            
            if (result)
            {
                _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
            }
            else
            {
                _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
            }
            
            return await Task.FromResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<Stream?> GetFileStreamAsync(string filePath)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                _logger.LogWarning("File not found: {FilePath}", filePath);
                return null;
            }

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return await Task.FromResult<Stream>(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file stream: {FilePath}", filePath);
            return null;
        }
    }

    public async Task<bool> FileExistsAsync(string filePath)
    {
        return await Task.FromResult(File.Exists(filePath));
    }

    public async Task<long> GetFileSizeAsync(string filePath)
    {
        var size = FileHelper.GetFileSize(filePath);
        return await Task.FromResult(size);
    }

    public async Task<string> SaveMedicalImageAsync(Stream fileStream, string filename)
    {
        var folderPath = FileConstants.StoragePaths.MedicalImagesFolder;
        return await SaveFileAsync(fileStream, filename, folderPath);
    }

    public async Task<string> SavePrescriptionPdfAsync(byte[] pdfBytes, string filename)
    {
        try
        {
            var folderPath = Path.Combine(_environment.ContentRootPath, FileConstants.StoragePaths.PrescriptionsFolder);
            FileHelper.EnsureDirectoryExists(folderPath);

            var uniqueFilename = FileHelper.GenerateUniqueFileName(filename);
            var filePath = Path.Combine(folderPath, uniqueFilename);

            await File.WriteAllBytesAsync(filePath, pdfBytes);
            
            _logger.LogInformation("Prescription PDF saved successfully: {FilePath}", filePath);
            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save prescription PDF: {Filename}", filename);
            throw;
        }
    }

    public string GetFileUrl(string filePath)
    {
        // Convert absolute file path to relative URL
        var contentRootPath = _environment.ContentRootPath;
        
        if (filePath.StartsWith(contentRootPath))
        {
            var relativePath = filePath.Substring(contentRootPath.Length).TrimStart(Path.DirectorySeparatorChar);
            return $"/{relativePath.Replace(Path.DirectorySeparatorChar, '/')}";
        }

        return filePath;
    }
}
