import doctorService from '../api/doctorService';
import { unwrapApiResponse } from '../api/apiUtils';

/**
 * Resolves the clinic doctor table id (not always the same as auth userId).
 */
export async function resolveDoctorId(user) {
  if (!user) return null;

  if (user.doctorId != null && user.doctorId !== '') {
    return Number(user.doctorId);
  }

  if (user.role === 'Doctor' || user.role === 'Radiologist' || user.role === 'Physiotherapist') {
    try {
      const profile = unwrapApiResponse(await doctorService.getProfile());
      const id = profile?.doctorId ?? profile?.DoctorId;
      if (id != null) return Number(id);
    } catch (error) {
      console.warn('Could not load doctor profile for doctorId', error);
    }
  }

  const fallback = user.userId ?? user.id;
  return fallback != null && !Number.isNaN(Number(fallback)) ? Number(fallback) : null;
}

export const isActiveBillingService = (service) =>
  service?.activeStatus === true || String(service?.status || '').toLowerCase() === 'active';

/** Numeric patient id for appointments (search returns patientId, auth uses userId). */
export const getPatientRecordId = (patient) =>
  patient?.patientId ?? patient?.PatientId ?? patient?.userId ?? patient?.id ?? null;

const DAY_NAME_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const INDEX_TO_DAY_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Monday–Friday (matches typical clinic hours and JS Date.getDay()). */
export const WEEKDAY_INDICES_MON_FRI = [1, 2, 3, 4, 5];

export const DEFAULT_WEEKDAY_SCHEDULE = WEEKDAY_INDICES_MON_FRI.map((index) => ({
  dayOfWeek: INDEX_TO_DAY_NAME[index],
}));

/**
 * Maps backend dayOfWeek (string name, numeric enum 0=Sunday…6=Saturday) to JS weekday index.
 */
export const parseDayOfWeekToIndex = (dayOfWeek) => {
  if (dayOfWeek == null || dayOfWeek === '') return null;

  if (typeof dayOfWeek === 'number' && dayOfWeek >= 0 && dayOfWeek <= 6) {
    return dayOfWeek;
  }

  const asNum = Number(dayOfWeek);
  if (!Number.isNaN(asNum) && asNum >= 0 && asNum <= 6) {
    return asNum;
  }

  const key = String(dayOfWeek).trim().toLowerCase();
  if (key in DAY_NAME_TO_INDEX) {
    return DAY_NAME_TO_INDEX[key];
  }

  return null;
};

export const formatDayOfWeekLabel = (dayOfWeek) => {
  const index = parseDayOfWeekToIndex(dayOfWeek);
  if (index != null) return INDEX_TO_DAY_NAME[index];
  return String(dayOfWeek || '');
};

export const getScheduleDayIndices = (scheduleDays) => {
  const indices = new Set();
  (scheduleDays || []).forEach((s) => {
    const idx = parseDayOfWeekToIndex(s.dayOfWeek ?? s.DayOfWeek);
    if (idx != null) indices.add(idx);
  });
  return indices;
};

export const normalizeScheduleList = (data) => {
  const inner = unwrapApiResponse(data);
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === 'object' && inner.scheduleId != null) return [inner];
  if (Array.isArray(data)) return data;
  return [];
};

/** Next future date (YYYY-MM-DD) on a configured schedule day; defaults to Mon–Fri if empty. */
export const getNextDateForScheduleDays = (scheduleDays, fromDate = new Date()) => {
  let indices = getScheduleDayIndices(scheduleDays);
  if (!indices.size) {
    indices = new Set(WEEKDAY_INDICES_MON_FRI);
  }

  const start = new Date(fromDate);
  start.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 28; offset += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    if (d < today) continue;
    if (indices.has(d.getDay())) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
};

/** Upcoming dates (YYYY-MM-DD) that match schedule weekdays (default Mon–Fri). */
export const getUpcomingScheduleDates = (scheduleDays, count = 14, fromDate = new Date()) => {
  let indices = getScheduleDayIndices(scheduleDays);
  if (!indices.size) {
    indices = new Set(WEEKDAY_INDICES_MON_FRI);
  }

  const dates = [];
  const start = new Date(fromDate);
  start.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 60 && dates.length < count; offset += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    if (d < today) continue;
    if (indices.has(d.getDay())) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
};

export const formatScheduleDaysSummary = (scheduleDays) => {
  const indices = [...getScheduleDayIndices(scheduleDays)].sort((a, b) => a - b);
  if (!indices.length) {
    return INDEX_TO_DAY_NAME.filter((_, i) => WEEKDAY_INDICES_MON_FRI.includes(i)).join(', ');
  }
  return indices.map((i) => INDEX_TO_DAY_NAME[i]).join(', ');
};
