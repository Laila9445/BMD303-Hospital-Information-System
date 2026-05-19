export const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return `${value.toLocaleString('en-EG')} EGP`;
};

export const statusColorMap = {
  Paid: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  Pending: 'text-amber-600 bg-amber-50 border-amber-100',
  Cancelled: 'text-rose-600 bg-rose-50 border-rose-100',
};

export const departmentColorMap = {
  Doctor: 'bg-blue-50 text-blue-700',
  Radiology: 'bg-purple-50 text-purple-700',
  Physiotherapy: 'bg-emerald-50 text-emerald-700',
};

export const resolvePatientId = (user) => {
  if (!user) return null;
  if (user.patientId) return user.patientId;
  if (user.id) return user.id;
  if (user.userId != null && !Number.isNaN(Number(user.userId))) {
    return `PAT-${1000 + Number(user.userId)}`;
  }
  return null;
};

export const resolvePatientName = (user) => {
  if (!user) return 'Patient';
  if (user.fullName) return user.fullName;
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (composed) return composed;
  return user.name || 'Patient';
};

export const toPatientBillingId = (rawId) => {
  if (rawId == null || rawId === '') return null;
  const value = String(rawId);
  if (value.startsWith('PAT-')) return value;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return `PAT-${1000 + numeric}`;
  }
  return value;
};
