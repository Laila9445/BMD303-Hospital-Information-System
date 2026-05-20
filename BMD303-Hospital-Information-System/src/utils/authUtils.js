/**
 * Auth helpers — JWT role is the source of truth for API permissions.
 */

export function getJwtRoleFromToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const role =
      payload.role ||
      payload.Role ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      (Array.isArray(payload.roles) ? payload.roles[0] : null);
    return role || null;
  } catch {
    return null;
  }
}

export function getJwtRole() {
  return getJwtRoleFromToken(localStorage.getItem('token'));
}

/** Align stored user.role with JWT (what the backend enforces). */
export function applyJwtRoleToUser(user, token = localStorage.getItem('token')) {
  if (!user) return user;
  const jwtRole = getJwtRoleFromToken(token);
  if (!jwtRole) return user;
  return { ...user, role: jwtRole };
}

export function canActAsDoctor() {
  return getJwtRole() === 'Doctor';
}

export function canActAsRadiologist() {
  return getJwtRole() === 'Radiologist';
}

export function canActAsPhysiotherapist() {
  return getJwtRole() === 'Physiotherapist';
}

export function canActAsPatient() {
  return getJwtRole() === 'Patient';
}

export function canActAsNurse() {
  return getJwtRole() === 'Nurse';
}

export function getRoleDashboardPath(role) {
  switch (role) {
    case 'Doctor':
      return '/doctor/dashboard';
    case 'Nurse':
      return '/nurse/dashboard';
    case 'Physiotherapist':
      return '/physio/staff';
    case 'Radiologist':
      return '/radiology/staff';
    case 'Patient':
      return '/patient/dashboard';
    default:
      return '/login';
  }
}

/** @deprecated Use canActAsDoctor() — API uses JWT only. */
export function isDoctorSession(user) {
  return canActAsDoctor();
}

export function getSessionRoleMismatch(user) {
  const jwtRole = getJwtRole();
  if (!jwtRole || !user?.role) return null;
  if (jwtRole !== user.role) return { profileRole: user.role, tokenRole: jwtRole };
  return null;
}
