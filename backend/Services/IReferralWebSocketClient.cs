using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services;

public interface IReferralWebSocketClient
{
    Task<bool> SendReferralAsync(ReferralData referral, CancellationToken cancellationToken = default);
}
