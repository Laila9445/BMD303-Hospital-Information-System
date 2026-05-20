import referralService from '../api/referralService';
import { unwrapList } from '../api/apiUtils';
import { resolveDoctorId } from './doctorUtils';

/** Maps UI values to backend referral contract (referralType prefix, PascalCase urgency). */

export const buildReferralType = (department, serviceName) => {
  const prefix = department === 'Radiology' ? 'radiology' : 'physiotherapy';
  const slug = String(serviceName || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${slug || 'general'}`;
};

export const normalizeUrgency = (urgency) => {
  const key = String(urgency || 'routine').toLowerCase();
  const map = { routine: 'Routine', urgent: 'Urgent', emergency: 'Emergency' };
  return map[key] || urgency;
};

export const getReferralId = (referral) =>
  referral?.referralId ?? referral?.id ?? null;

/** Keep one row per referral id (guards against duplicate API rows). */
export const dedupeReferralsById = (referrals) => {
  const seen = new Set();
  return (referrals || []).filter((r) => {
    const id = getReferralId(r);
    if (id == null) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const filterReferralsByDepartment = (referrals, department) => {
  const dept = String(department).toLowerCase();
  const typePrefix = dept === 'radiology' ? 'radiology-' : dept === 'physiotherapy' ? 'physiotherapy-' : null;

  return dedupeReferralsById(referrals).filter((r) => {
    if (String(r.department || '').toLowerCase() === dept) return true;
    if (typePrefix && String(r.referralType || '').toLowerCase().startsWith(typePrefix)) return true;
    return false;
  });
};

/**
 * Loads referrals for the logged-in doctor. Tries my-referrals first (JWT-based),
 * then GET /Referrals/doctor/{id} when needed.
 */
export async function loadDoctorReferralsForUser(user) {
  const doctorId = await resolveDoctorId(user);
  let list = [];
  let error = null;

  try {
    const mine = unwrapList(await referralService.getMyReferrals());
    list = doctorId
      ? mine.filter((r) => r.doctorId == null || Number(r.doctorId) === Number(doctorId))
      : mine;
  } catch (e) {
    error = e;
  }

  if ((!list || list.length === 0) && doctorId) {
    try {
      list = unwrapList(await referralService.getDoctorReferrals(doctorId));
      error = null;
    } catch (e) {
      if (!list?.length) error = error || e;
    }
  }

  return {
    referrals: dedupeReferralsById(list),
    doctorId,
    error: list?.length ? null : error,
  };
}
