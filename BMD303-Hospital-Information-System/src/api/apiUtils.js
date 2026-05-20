/**
 * Normalizes backend response shapes (ApiResponse wrapper vs raw arrays/DTOs).
 */

export const unwrapApiResponse = (data) => {
  if (data == null) return data;
  if (typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'success') && 'data' in data) {
    return data.data;
  }
  return data;
};

export const unwrapList = (data) => {
  const inner = unwrapApiResponse(data);
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(data)) return data;
  return [];
};

export const unwrapAuthResponse = (data) => {
  if (!data) return null;
  if (data.token && data.user) return data;
  const inner = unwrapApiResponse(data);
  if (inner?.token && inner?.user) return inner;
  return data;
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const requestUrl = String(error?.config?.url || '');

  if (status === 403) {
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    if (requestUrl.includes('/billing/invoices')) {
      return 'Only Nurse or Admin can create invoices. Doctors and specialists should create the referral only; billing is done under Nurse → Billing.';
    }
    if (requestUrl.includes('/Referrals/doctor/')) {
      return (
        'Could not load referrals for this doctor profile (403). ' +
        'Log out and sign in again as Doctor. If it persists, your login token role may not match your account.'
      );
    }
    if (requestUrl.includes('/Referrals') && String(error?.config?.method || '').toLowerCase() === 'post') {
      return (
        'The server rejected creating this referral (403). ' +
        'Only a Doctor account can create referrals — log out, then log in again with your Doctor email/password. ' +
        'If you are a Radiologist or Physiotherapist, use Staff dashboard to accept referrals, not Create Referral.'
      );
    }
    if (requestUrl.includes('/Referrals') && requestUrl.includes('/status')) {
      return 'Only the assigned specialist (Radiologist or Physiotherapist) can update this referral status for your role.';
    }
    if (requestUrl.includes('/Radiology/') || requestUrl.includes('/Physio/')) {
      return 'This page is for Radiologist or Physiotherapist accounts. Log in with the correct role or use Doctor → Referrals.';
    }
    return 'Forbidden: your role is not allowed to perform this action.';
  }

  if (!data) {
    if (error?.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the backend running on http://localhost:5000?';
    }
    return error?.message || fallback;
  }
  if (typeof data === 'string') return data;
  if (data.code === 'INVALID_STATUS_TRANSITION') {
    return data.message || 'This action is not allowed for your role or the referral status.';
  }
  if (data.error) return data.error;
  if (data.message) return data.message;
  if (data.title && data.errors) {
    const parts = Object.entries(data.errors).flatMap(([field, msgs]) =>
      (Array.isArray(msgs) ? msgs : [msgs]).map((m) => `${field}: ${m}`)
    );
    return parts.join('; ') || data.title;
  }
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().join('; ');
  }
  return fallback;
};
