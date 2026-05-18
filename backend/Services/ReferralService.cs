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

        private async Task<int?> GetDoctorDomainIdByUserIdAsync(int userId)
        {
            return await _context.Doctors
                .AsNoTracking()
                .Where(d => d.UserId == userId)
                .Select(d => d.DoctorId)
                .FirstOrDefaultAsync();
        }

        private async Task<int?> GetPatientDomainIdByUserIdAsync(int userId)
        {
            return await _context.Patients
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .Select(p => p.PatientId)
                .FirstOrDefaultAsync();
        }

        private async Task<UserModel?> GetIdentityUserByDoctorDomainIdAsync(int doctorId)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Where(d => d.DoctorId == doctorId)
                .Select(d => d.User)
                .FirstOrDefaultAsync();
        }

        public async Task<ReferralDTO?> CreateReferralAsync(CreateReferralRequest request)
        {
            try
            {
                var doctorProfile = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.DoctorId == request.DoctorId);

                if (doctorProfile == null || doctorProfile.User == null || doctorProfile.User.Role != "Doctor")
                {
                    throw new BusinessException("DOCTOR_NOT_FOUND", $"Doctor with ID {request.DoctorId} was not found.");
                }

                var patientProfile = await _context.Patients
                    .FirstOrDefaultAsync(p => p.PatientId == request.PatientId);

                if (patientProfile == null)
                {
                    throw new BusinessException("PATIENT_NOT_FOUND", $"Patient with ID {request.PatientId} was not found.");
                }

                var identityPatient = await _context.Users.FindAsync(patientProfile.UserId);
                if (identityPatient == null || identityPatient.Role != "Patient")
                {
                    throw new BusinessException("PATIENT_NOT_FOUND", $"Patient with ID {request.PatientId} was not found.");
                }

                var referral = new ReferralModel
                {
                    PatientId = patientProfile.PatientId,
                    PatientExternalId = string.IsNullOrWhiteSpace(patientProfile.ExternalPatientId)
                        ? $"PAT-{patientProfile.PatientId}"
                        : patientProfile.ExternalPatientId,
                    PatientName = patientProfile.FullName,
                    DoctorId = doctorProfile.DoctorId,
                    DoctorName = $"{doctorProfile.User.FirstName} {doctorProfile.User.LastName}",
                    ReferralType = request.ReferralType,
                    Urgency = request.Urgency,
                    Reason = request.Reason,
                    Notes = request.Notes,
                    Status = "Pending",
                    FhirServiceRequestId = $"ServiceRequest/{Guid.NewGuid()}",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Set Department and AssignedToRole
                if (referral.ReferralType.StartsWith("radiology-"))
                {
                    referral.Department = "Radiology";
                    referral.AssignedToRole = "Radiologist";
                }
                else if (referral.ReferralType.StartsWith("physiotherapy-"))
                {
                    referral.Department = "Physiotherapy";
                    referral.AssignedToRole = "Physiotherapist";
                }
                else
                {
                    referral.Department = "Doctor";
                    referral.AssignedToRole = "Doctor";
                }

                _context.Referrals.Add(referral);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Referral created with ID: {ReferralId} for patient: {PatientId}",
                    referral.ReferralId, referral.PatientId);
                
                // Create notifications
                var usersToNotify = await _context.Users.Where(u => u.Role == referral.AssignedToRole).ToListAsync();
                foreach (var user in usersToNotify)
                {
                    var notification = new NotificationModel
                    {
                        UserId = user.Id,
                        Title = "New Referral Received",
                        Message = $"Dr. {referral.DoctorName} referred patient {referral.PatientName} for {referral.ReferralType}. Urgency: {referral.Urgency}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                }
                await _context.SaveChangesAsync();


                return await GetReferralByIdAsync(referral.ReferralId);
            }
            catch (BusinessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating referral for patient: {PatientId}", request.PatientId);
                return null;
            }
        }

        public async Task<List<ReferralDTO>> GetDoctorReferralsAsync(int doctorId, string? status = null)
        {
            try
            {
                var query = _context.Referrals
                    .Where(r => r.DoctorId == doctorId);

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                var referrals = await query
                    .OrderByDescending(r => r.CreatedDate)
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
                    .Where(r => r.PatientExternalId == patientExternalId)
                    .OrderByDescending(r => r.CreatedDate)
                    .ToListAsync();

                return referrals.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving referrals for patient: {PatientId}", patientExternalId);
                return new List<ReferralDTO>();
            }
        }

        public async Task<List<ReferralDTO>> GetMyReferralsAsync(int userId, string userRole, string? status = null)
        {
            try
            {
                IQueryable<ReferralModel> query = _context.Referrals;

                switch (userRole)
                {
                    case "Doctor":
                    {
                        var doctorId = await GetDoctorDomainIdByUserIdAsync(userId);
                        if (!doctorId.HasValue)
                        {
                            return new List<ReferralDTO>();
                        }

                        query = query.Where(r => r.DoctorId == doctorId.Value);
                        break;
                    }
                    case "Physiotherapist":
                        query = query.Where(r => r.AssignedToRole == "Physiotherapist");
                        break;
                    case "Radiologist":
                        query = query.Where(r => r.AssignedToRole == "Radiologist");
                        break;
                    case "Patient":
                    {
                        var patientId = await GetPatientDomainIdByUserIdAsync(userId);
                        if (!patientId.HasValue)
                        {
                            return new List<ReferralDTO>();
                        }

                        var patientExternalId = $"PAT-{patientId.Value}";
                        query = query.Where(r => r.PatientId == patientId.Value || r.PatientExternalId == patientExternalId);
                        break;
                    }
                    case "Nurse":
                        // No filter, return all
                        break;
                    default:
                        return new List<ReferralDTO>();
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(r => r.Status == status);
                }

                if (userRole is "Physiotherapist" or "Radiologist")
                {
                    query = query.OrderBy(r => r.Urgency == "Emergency" ? 0 : r.Urgency == "Urgent" ? 1 : 2)
                                 .ThenByDescending(r => r.CreatedDate);
                }
                else
                {
                    query = query.OrderByDescending(r => r.CreatedDate);
                }

                var referrals = await query.ToListAsync();
                return referrals.Select(MapToDTO).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving 'my-referrals' for user {UserId} with role {UserRole}", userId, userRole);
                return new List<ReferralDTO>();
            }
        }

        public async Task<bool> UpdateReferralStatusAsync(int referralId, UpdateReferralStatusRequest request, int userId, string userRole)
        {
            try
            {
                var referral = await _context.Referrals.FindAsync(referralId);
                if (referral == null)
                {
                    _logger.LogWarning("Referral not found: {ReferralId}", referralId);
                    return false;
                }

                var oldStatus = referral.Status;
                var newStatus = request.Status;

                var currentDoctorId = userRole == "Doctor"
                    ? await GetDoctorDomainIdByUserIdAsync(userId)
                    : null;

                ValidateStatusTransition(referral, oldStatus, newStatus, userId, userRole, currentDoctorId);

                referral.Status = newStatus;
                referral.UpdatedAt = DateTime.UtcNow;

                string notificationTitle = "";
                string notificationMessage = "";

                if (newStatus == "Completed")
                {
                    if (string.IsNullOrEmpty(request.CompletionNotes))
                    {
                        throw new BusinessException("COMPLETION_NOTES_REQUIRED", "Completion notes are required when status is 'Completed'");
                    }
                    referral.CompletionNotes = request.CompletionNotes;
                    notificationTitle = "Referral Completed";
                    notificationMessage = $"Referral for {referral.PatientName} completed. Notes: {request.CompletionNotes}";
                }
                else if (newStatus == "Cancelled")
                {
                    if (string.IsNullOrEmpty(request.CancellationReason))
                    {
                        throw new BusinessException("CANCELLATION_REASON_REQUIRED", "Cancellation reason is required when status is 'Cancelled'");
                    }
                    referral.CancellationReason = request.CancellationReason;
                    notificationTitle = "Referral Cancelled";
                    notificationMessage = $"Your referral for {referral.PatientName} was cancelled. Reason: {request.CancellationReason}";
                }
                else if (newStatus == "Accepted")
                {
                    notificationTitle = "Referral Accepted";
                    notificationMessage = $"Your referral for {referral.PatientName} ({referral.ReferralType}) has been accepted";
                }


                await _context.SaveChangesAsync();

                // Create notification for the referring doctor
                if (!string.IsNullOrEmpty(notificationTitle))
                {
                    var doctorUser = await GetIdentityUserByDoctorDomainIdAsync(referral.DoctorId);
                    if (doctorUser != null)
                    {
                        var notification = new NotificationModel
                        {
                            UserId = doctorUser.Id,
                            Title = notificationTitle,
                            Message = notificationMessage,
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                        await _context.SaveChangesAsync();
                    }
                }

                _logger.LogInformation("Referral {ReferralId} status updated from {OldStatus} to: {NewStatus}", referralId, oldStatus, newStatus);
                return true;
            }
            catch (BusinessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating referral status: {ReferralId}", referralId);
                return false;
            }
        }

        public async Task<bool> SendToExternalSystemAsync(int referralId)
        {
            // This method is no longer required as per the new implementation.
            // It can be removed or left as a placeholder for future use.
            await Task.CompletedTask;
            return true;
        }

        private ReferralDTO MapToDTO(ReferralModel referral)
        {
            return new ReferralDTO
            {
                ReferralId = referral.ReferralId,
                PatientId = referral.PatientId,
                PatientName = referral.PatientName,
                PatientExternalId = referral.PatientExternalId,
                DoctorId = referral.DoctorId,
                DoctorName = referral.DoctorName,
                ReferralType = referral.ReferralType,
                Department = referral.Department,
                AssignedToRole = referral.AssignedToRole,
                Urgency = referral.Urgency,
                Reason = referral.Reason,
                Notes = referral.Notes,
                Status = referral.Status,
                LinkedAppointmentId = referral.LinkedAppointmentId,
                CompletionNotes = referral.CompletionNotes,
                CancellationReason = referral.CancellationReason,
                ReportAttached = referral.ReportAttached,
                FhirServiceRequestId = referral.FhirServiceRequestId,
                CreatedDate = referral.CreatedDate,
                UpdatedAt = referral.UpdatedAt ?? DateTime.UtcNow
            };
        }

        public async Task<ReferralStatsDTO> GetReferralStatsAsync(int userId, string userRole)
        {
            IQueryable<ReferralModel> query = _context.Referrals;

            switch (userRole)
            {
                case "Doctor":
                {
                    var doctorId = await GetDoctorDomainIdByUserIdAsync(userId);
                    if (!doctorId.HasValue)
                    {
                        return new ReferralStatsDTO();
                    }

                    query = query.Where(r => r.DoctorId == doctorId.Value);
                    break;
                }
                case "Physiotherapist":
                    query = query.Where(r => r.AssignedToRole == "Physiotherapist");
                    break;
                case "Radiologist":
                    query = query.Where(r => r.AssignedToRole == "Radiologist");
                    break;
                case "Nurse":
                    // No filter for nurse
                    break;
                default:
                    return new ReferralStatsDTO(); // Return empty stats for other roles
            }

            var stats = new ReferralStatsDTO
            {
                Total = await query.CountAsync(),
                Pending = await query.CountAsync(r => r.Status == "Pending"),
                Accepted = await query.CountAsync(r => r.Status == "Accepted"),
                AppointmentBooked = await query.CountAsync(r => r.Status == "Appointment Booked"),
                Completed = await query.CountAsync(r => r.Status == "Completed"),
                Cancelled = await query.CountAsync(r => r.Status == "Cancelled"),
                ByUrgency = new Dictionary<string, int>
                {
                    ["emergency"] = await query.CountAsync(r => r.Urgency == "Emergency"),
                    ["urgent"] = await query.CountAsync(r => r.Urgency == "Urgent"),
                    ["routine"] = await query.CountAsync(r => r.Urgency == "Routine")
                },
                ByDepartment = await query.Where(r => r.Department == "Radiology" || r.Department == "Physiotherapy")
                    .GroupBy(r => r.Department)
                    .ToDictionaryAsync(g => g.Key, g => g.Count())
            };

            return stats;
        }

        private static void ValidateStatusTransition(ReferralModel referral, string oldStatus, string newStatus, int userId, string userRole, int? currentDoctorId = null)
        {
            if (oldStatus == newStatus)
            {
                return;
            }

            if (oldStatus is "Completed" or "Cancelled")
            {
                throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
            }

            switch (oldStatus)
            {
                case "Pending":
                    if (newStatus == "Accepted")
                    {
                        if (userRole is not ("Physiotherapist" or "Radiologist"))
                        {
                            throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
                        }
                        return;
                    }

                    if (newStatus == "Cancelled")
                    {
                        if (userRole == "Nurse")
                        {
                            return;
                        }

                        if (userRole == "Doctor")
                        {
                            var effectiveDoctorId = currentDoctorId ?? userId;
                            if (referral.DoctorId == effectiveDoctorId)
                            {
                                return;
                            }
                        }

                        throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
                    }
                    break;

                case "Accepted":
                    if (newStatus == "Appointment Booked")
                    {
                        // Allow transition to Appointment Booked (from booking a referral-linked appointment)
                        return;
                    }

                    if (newStatus == "Cancelled")
                    {
                        if (userRole is "Physiotherapist" or "Radiologist")
                        {
                            return;
                        }
                        throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
                    }
                    break;

                case "Appointment Booked":
                    if (newStatus == "Completed")
                    {
                        if (userRole is "Physiotherapist" or "Radiologist")
                        {
                            return;
                        }
                        throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
                    }
                    break;
            }

            throw new BusinessException("INVALID_STATUS_TRANSITION", $"Invalid status transition from {oldStatus} to {newStatus}");
        }
    }
}
