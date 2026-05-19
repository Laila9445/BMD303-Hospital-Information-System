import { getPatientRecordId } from './doctorUtils';

const RECENT_PATIENTS_KEY = 'clinic_recent_patients';
const MAX_RECENT = 12;

export const getRecentPatients = () => {
  try {
    const raw = sessionStorage.getItem(RECENT_PATIENTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const addRecentPatient = (patient) => {
  if (!patient) return;
  const id = getPatientRecordId(patient);
  if (id == null) return;

  const entry = {
    patientId: id,
    userId: patient.userId ?? patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    gender: patient.gender,
    age: patient.age,
    searchedAt: Date.now(),
  };

  const existing = getRecentPatients().filter((p) => String(p.patientId) !== String(id));
  const next = [entry, ...existing].slice(0, MAX_RECENT);
  sessionStorage.setItem(RECENT_PATIENTS_KEY, JSON.stringify(next));
};

const scorePatient = (patient, query) => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return 0;

  const id = String(getPatientRecordId(patient) ?? '');
  const first = String(patient.firstName || '').toLowerCase();
  const last = String(patient.lastName || '').toLowerCase();
  const full = `${first} ${last}`.trim();
  const email = String(patient.email || '').toLowerCase();

  if (id === q) return 1000;
  if (id.includes(q)) return 900;
  if (full === q) return 850;
  if (full.startsWith(q)) return 800;
  if (first.startsWith(q) || last.startsWith(q)) return 750;
  if (full.includes(q)) return 700;
  if (first.includes(q) || last.includes(q)) return 650;
  if (email.includes(q)) return 500;
  return 0;
};

/** Sort so best match to query is first; higher score wins. */
export const rankPatientSearchResults = (patients, query) => {
  const list = Array.isArray(patients) ? [...patients] : [];
  const q = String(query || '').trim();
  if (!q) {
    return list.sort((a, b) => {
      const ta = a.searchedAt || 0;
      const tb = b.searchedAt || 0;
      return tb - ta;
    });
  }

  return list
    .map((p) => ({ patient: p, score: scorePatient(p, q) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.patient);
};

/** Recent patients matching query appear before other API hits. */
export const mergeRecentWithSearchResults = (apiPatients, query) => {
  const q = String(query || '').trim().toLowerCase();
  const recent = getRecentPatients();
  if (!q) return recent;

  const recentMatches = rankPatientSearchResults(recent, q);
  const apiRanked = rankPatientSearchResults(apiPatients, q);
  const seen = new Set();

  const merged = [];
  [...recentMatches, ...apiRanked].forEach((p) => {
    const id = String(getPatientRecordId(p));
    if (!id || seen.has(id)) return;
    seen.add(id);
    merged.push(p);
  });
  return merged;
};
