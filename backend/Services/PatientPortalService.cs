using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    /// <summary>
    /// Service for integrating with Patient Portal microservice
    /// Retrieves patient data from external Patient Portal API
    /// </summary>
    public interface IPatientPortalService
    {
        Task<PatientPortalDTO?> GetPatientByExternalIdAsync(string externalPatientId);
        Task<PatientMedicalHistoryDTO?> GetPatientMedicalHistoryAsync(string externalPatientId);
        Task<bool> ValidatePatientExistsAsync(string externalPatientId);
        Task SyncPatientCacheAsync(string externalPatientId);
        Task<PatientModel?> GetCachedPatientAsync(string externalPatientId);
    }

    public class PatientPortalService : IPatientPortalService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PatientPortalService> _logger;
        private readonly ClinicDbContext _context;

        public PatientPortalService(
            IHttpClientFactory httpClientFactory,
            ILogger<PatientPortalService> logger,
            ClinicDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _context = context;
        }

        public async Task<PatientPortalDTO?> GetPatientByExternalIdAsync(string externalPatientId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("PatientPortalApi");
                
                // If Patient Portal API is not configured, return null
                if (client.BaseAddress == null)
                {
                    _logger.LogWarning("Patient Portal API is not configured");
                    return null;
                }
                
                var response = await client.GetAsync($"/api/patients/{externalPatientId}");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to retrieve patient {PatientId} from Patient Portal. Status: {Status}",
                        externalPatientId, response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<PatientPortalDTO>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient {PatientId} from Patient Portal", externalPatientId);
                return null;
            }
        }

        public async Task<PatientMedicalHistoryDTO?> GetPatientMedicalHistoryAsync(string externalPatientId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("PatientPortalApi");
                
                if (client.BaseAddress == null)
                {
                    _logger.LogWarning("Patient Portal API is not configured");
                    return null;
                }
                
                var response = await client.GetAsync($"/api/patients/{externalPatientId}/medical-history");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to retrieve medical history for patient {PatientId}. Status: {Status}",
                        externalPatientId, response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<PatientMedicalHistoryDTO>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving medical history for patient {PatientId}", externalPatientId);
                return null;
            }
        }

        public async Task<bool> ValidatePatientExistsAsync(string externalPatientId)
        {
            try
            {
                // First check local cache
                var cachedPatient = await GetCachedPatientAsync(externalPatientId);
                if (cachedPatient != null)
                {
                    return true;
                }
                
                // Check with Patient Portal API
                var client = _httpClientFactory.CreateClient("PatientPortalApi");
                
                if (client.BaseAddress == null)
                {
                    _logger.LogWarning("Patient Portal API is not configured");
                    return false;
                }
                
                var response = await client.GetAsync($"/api/patients/{externalPatientId}/exists");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating patient {PatientId} existence", externalPatientId);
                return false;
            }
        }

        public async Task<PatientModel?> GetCachedPatientAsync(string externalPatientId)
        {
            try
            {
                return await _context.Patients
                    .FirstOrDefaultAsync(p => p.ExternalPatientId == externalPatientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cached patient {PatientId}", externalPatientId);
                return null;
            }
        }

        /// <summary>
        /// Syncs patient basic info to local cache table for quick lookups
        /// </summary>
        public async Task SyncPatientCacheAsync(string externalPatientId)
        {
            try
            {
                var patientData = await GetPatientByExternalIdAsync(externalPatientId);
                if (patientData == null) return;

                var existingCache = await GetCachedPatientAsync(externalPatientId);

                if (existingCache != null)
                {
                    // Update cache
                    existingCache.FullName = $"{patientData.FirstName} {patientData.LastName}";
                    existingCache.PhoneNumber = patientData.PhoneNumber;
                    existingCache.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new cache entry
                    _context.Patients.Add(new PatientModel
                    {
                        ExternalPatientId = externalPatientId,
                        FullName = $"{patientData.FirstName} {patientData.LastName}",
                        PhoneNumber = patientData.PhoneNumber,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Synced patient cache for {PatientId}", externalPatientId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing patient cache for {PatientId}", externalPatientId);
            }
        }
    }

    // DTOs for Patient Portal API responses
    public class PatientPortalDTO
    {
        public string ExternalPatientId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string? EmergencyContact { get; set; }
    }

    public class PatientMedicalHistoryDTO
    {
        public string? Allergies { get; set; }
        public string? ChronicConditions { get; set; }
        public string? CurrentMedications { get; set; }
        public string? BloodType { get; set; }
        public string? SurgicalHistory { get; set; }
        public string? FamilyHistory { get; set; }
    }
}
