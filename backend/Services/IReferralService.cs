using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IReferralService
    {
        /// <summary>
        /// Create a new referral
        /// </summary>
        Task<ReferralDTO?> CreateReferralAsync(CreateReferralRequest request);

        /// <summary>
        /// Get all referrals created by a specific doctor
        /// </summary>
        Task<List<ReferralDTO>> GetDoctorReferralsAsync(int doctorId, string? status = null);

        /// <summary>
        /// Get a specific referral by ID
        /// </summary>
        Task<ReferralDTO?> GetReferralByIdAsync(int referralId);

        /// <summary>
        /// Update referral status
        /// </summary>
        Task<bool> UpdateReferralStatusAsync(int referralId, UpdateReferralStatusRequest request);

        /// <summary>
        /// Send referral to external physiotherapy system
        /// </summary>
        Task<bool> SendToExternalSystemAsync(int referralId);

        /// <summary>
        /// Get all referrals for a patient (using external patient ID)
        /// </summary>
        Task<List<ReferralDTO>> GetPatientReferralsAsync(string patientExternalId);
    }
}
