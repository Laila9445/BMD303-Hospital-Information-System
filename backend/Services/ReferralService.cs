using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;
using System.Net.Http.Json;

namespace CLINICSYSTEM.Services
{
    public class ReferralService : IReferralService
    {
        private readonly ClinicDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ReferralService> _logger;

        public ReferralService(
            ClinicDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<ReferralService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ReferralDTO?> CreateReferralAsync(CreateReferralRequest request)
        {
            try
            {
                var referral = new ReferralModel
                {
                    PatientExternalId = request.PatientExternalId,
                    DoctorId = request.DoctorId,
                    ReferralType = request.ReferralType,
                    Reason = request.Reason,
                    Diagnosis = request.Diagnosis,
                    RecommendedTreatment = request.RecommendedTreatment,
                    Priority = request.Priority,
                    DoctorNotes = request.DoctorNotes,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Referrals.Add(referral);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Referral created with ID: {ReferralId} for patient: {PatientId}", 
                    referral.ReferralId, referral.PatientExternalId);

                // Automatically send to external system if configured
                if (request.AutoSend && request.ReferralType == "Physiotherapy")
                {
                    await SendToExternalSystemAsync(referral.ReferralId);
                }

                return await GetReferralByIdAsync(referral.ReferralId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating referral for patient: {PatientId}", request.PatientExternalId);
                return null;
            }
        }

        public async Task<List<ReferralDTO>> GetDoctorReferralsAsync(int doctorId, string? status = null)
        {
            try
            {
                var query = _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .Where(r => r.DoctorId == doctorId);

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                var referrals = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return referrals.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for doctor: {DoctorId}", doctorId);
                return new List<ReferralDTO>();
            }
        }

        public async Task<ReferralDTO?> GetReferralByIdAsync(int referralId)
        {
            try
            {
                var referral = await _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .FirstOrDefaultAsync(r => r.ReferralId == referralId);

                return referral != null ? MapToDTO(referral) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referral: {ReferralId}", referralId);
                return null;
            }
        }

        public async Task<List<ReferralDTO>> GetPatientReferralsAsync(string patientExternalId)
        {
            try
            {
                var referrals = await _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .Where(r => r.PatientExternalId == patientExternalId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return referrals.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for patient: {PatientId}", patientExternalId);
                return new List<ReferralDTO>();
            }
        }

        public async Task<bool> UpdateReferralStatusAsync(int referralId, UpdateReferralStatusRequest request)
        {
            try
            {
                var referral = await _context.Referrals.FindAsync(referralId);
                if (referral == null)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", referralId);
                    return false;
                }

                referral.Status = request.Status;
                referral.UpdatedAt = DateTime.UtcNow;

                // Update feedback if provided
                if (!string.IsNullOrEmpty(request.Feedback))
                {
                    referral.ExternalServiceFeedback = request.Feedback;
                }

                // Set appropriate timestamps based on status
                switch (request.Status)
                {
                    case "Sent":
                        referral.SentAt = DateTime.UtcNow;
                        break;
                    case "Accepted":
                        referral.AcceptedAt = DateTime.UtcNow;
                        break;
                    case "Completed":
                        referral.CompletedAt = DateTime.UtcNow;
                        break;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Referral {ReferralId} status updated to: {Status}", referralId, request.Status);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating referral status: {ReferralId}", referralId);
                return false;
            }
        }

        public async Task<bool> SendToExternalSystemAsync(int referralId)
        {
            try
            {
                var referral = await _context.Referrals
                    .Include(r => r.Doctor)
                        .ThenInclude(d => d!.User)
                    .FirstOrDefaultAsync(r => r.ReferralId == referralId);

                if (referral == null)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", referralId);
                    return false;
                }

                // Get external service configuration
                var externalServiceUrl = _configuration["ExternalServices:PhysiotherapyApi:BaseUrl"];
                if (string.IsNullOrEmpty(externalServiceUrl))
                {
                    _logger.LogError("Physiotherapy API URL not configured");
                    return false;
                }

                // Create HTTP client
                var httpClient = _httpClientFactory.CreateClient("PhysiotherapyApi");

                // Prepare payload
                var payload = new
                {
                    PatientExternalId = referral.PatientExternalId,
                    ReferringDoctorId = referral.DoctorId,
                    ReferringDoctorName = referral.Doctor?.User != null 
                        ? $"{referral.Doctor.User.FirstName} {referral.Doctor.User.LastName}"
                        : "Unknown Doctor",
                    Diagnosis = referral.Diagnosis,
                    Reason = referral.Reason,
                    RecommendedTreatment = referral.RecommendedTreatment,
                    Priority = referral.Priority,
                    DoctorNotes = referral.DoctorNotes,
                    ReferralDate = referral.CreatedAt
                };

                // Send to external system
                var response = await httpClient.PostAsJsonAsync($"{externalServiceUrl}/api/referrals/receive", payload);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<ExternalReferralResponse>();

                    // Update referral with external reference
                    referral.ExternalReferralId = result?.ReferralId;
                    referral.ExternalServiceUrl = externalServiceUrl;
                    referral.Status = "Sent";
                    referral.SentAt = DateTime.UtcNow;
                    referral.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Referral {ReferralId} sent successfully to external system. External ID: {ExternalId}",
                        referralId, result?.ReferralId);
                    return true;
                }
                else
                {
                    _logger.LogError("Failed to send referral {ReferralId} to external system. Status: {Status}",
                        referralId, response.StatusCode);
                    return false;
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error sending referral {ReferralId} to external system", referralId);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending referral {ReferralId} to external system", referralId);
                return false;
            }
        }

        private ReferralDTO MapToDTO(ReferralModel referral)
        {
            return new ReferralDTO
            {
                ReferralId = referral.ReferralId,
                PatientExternalId = referral.PatientExternalId,
                DoctorId = referral.DoctorId,
                DoctorName = referral.Doctor?.User != null
                    ? $"{referral.Doctor.User.FirstName} {referral.Doctor.User.LastName}"
                    : "Unknown",
                ReferralType = referral.ReferralType,
                Reason = referral.Reason,
                Diagnosis = referral.Diagnosis,
                RecommendedTreatment = referral.RecommendedTreatment,
                Priority = referral.Priority,
                Status = referral.Status,
                ExternalReferralId = referral.ExternalReferralId,
                ExternalServiceUrl = referral.ExternalServiceUrl,
                CreatedAt = referral.CreatedAt,
                SentAt = referral.SentAt,
                AcceptedAt = referral.AcceptedAt,
                CompletedAt = referral.CompletedAt,
                DoctorNotes = referral.DoctorNotes,
                ExternalServiceFeedback = referral.ExternalServiceFeedback
            };
        }
    }
}
