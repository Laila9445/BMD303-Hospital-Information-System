using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Exceptions;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class ReferralService : IReferralService
    {
        private readonly ClinicDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ReferralService> _logger;
        private readonly IReferralWebSocketClient _referralWebSocketClient;

        public ReferralService(
            ClinicDbContext context,
            IConfiguration configuration,
            IReferralWebSocketClient referralWebSocketClient,
            ILogger<ReferralService> logger)
        {
            _context = context;
            _configuration = configuration;
            _referralWebSocketClient = referralWebSocketClient;
            _logger = logger;
        }

        public async Task<ReferralDTO?> CreateReferralAsync(CreateReferralRequest request)
        {
            try
            {
                var doctorExists = await _context.Doctors.AnyAsync(d => d.DoctorId == request.DoctorId);
                if (!doctorExists)
                {
                    throw new BusinessException(
                        "DOCTOR_NOT_FOUND",
                        $"Doctor with ID {request.DoctorId} was not found.");
                }

                var referral = new ReferralModel
                {
                    PatientExternalId = request.PatientExternalId,
                    PatientPhone = request.PatientPhone,
                    DoctorId = request.DoctorId,
                    ReferralType = request.ReferralType,
                    Reason = request.Reason,
                    Diagnosis = request.Diagnosis,
                    RecommendedTreatment = request.RecommendedTreatment,
                    Priority = request.Priority,
                    DoctorNotes = request.DoctorNotes,
                    ExternalReferralId = request.ExternalReferralId,
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
            catch (BusinessException)
            {
                throw;
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

                var outboundReferralId = !string.IsNullOrWhiteSpace(referral.ExternalReferralId)
                    ? referral.ExternalReferralId
                    : referral.ReferralId.ToString();

                var wsReferralData = new ReferralData
                {
                    ReferralId = outboundReferralId,
                    ReferringDoctor = referral.Doctor?.User != null
                        ? $"Dr. {referral.Doctor.User.FirstName} {referral.Doctor.User.LastName}".Trim()
                        : "Unknown Doctor",
                    ServiceRequested = referral.ReferralType,
                    DoctorNotes = referral.DoctorNotes ?? referral.Reason,
                    Priority = MapPriority(referral.Priority),
                    CreatedAt = referral.CreatedAt,
                    Patient = new ReferralPatient
                    {
                        Name = referral.PatientExternalId,
                        Phone = referral.PatientPhone,
                        Email = null,
                        DateOfBirth = null
                    }
                };

                await _referralWebSocketClient.SendReferralAsync(wsReferralData);

                referral.ExternalReferralId = wsReferralData.ReferralId;
                referral.ExternalServiceUrl = _configuration["ReferralWebSocket:EndpointUrl"];
                referral.Status = "Sent";
                referral.SentAt = DateTime.UtcNow;
                referral.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "Referral {ReferralId} sent successfully via WebSocket with external ID {ExternalId}",
                    referralId, wsReferralData.ReferralId);
                return true;
            }
            catch (TimeoutException ex)
            {
                _logger.LogError(ex, "Timeout waiting acknowledgement for referral {ReferralId}", referralId);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending referral {ReferralId} via WebSocket", referralId);
                return false;
            }
        }

        private static string MapPriority(string priority)
        {
            return priority switch
            {
                "Urgent" => "urgent",
                "High" => "urgent",
                _ => "routine"
            };
        }

        private ReferralDTO MapToDTO(ReferralModel referral)
        {
            return new ReferralDTO
            {
                ReferralId = referral.ReferralId,
                PatientExternalId = referral.PatientExternalId,
                PatientPhone = referral.PatientPhone,
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
