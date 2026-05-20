/** Shared slot locking for physio/radiology public booking (localStorage). */

export function getBookingsStorageKey(department) {
  return department === 'radiology' ? 'radiologyAppointments' : 'physioAppointments';
}

export function readDepartmentBookings(department) {
  try {
    const raw = localStorage.getItem(getBookingsStorageKey(department));
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDepartmentBookings(department, list) {
  localStorage.setItem(getBookingsStorageKey(department), JSON.stringify(list));
  window.dispatchEvent(new Event(`${department}-appointments-updated`));
}

/** Normalize date string from booking record or Date object. */
export function normalizeBookingDate(dateValue) {
  if (!dateValue) return '';
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  const str = String(dateValue).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  try {
    const d = new Date(`${str}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    /* ignore */
  }
  return str;
}

function bookingDateIso(booking) {
  return normalizeBookingDate(booking?.dateIso || booking?.date);
}

export function isSlotTaken(department, dateIso, timeLabel, excludeId = null) {
  const bookings = readDepartmentBookings(department);
  return bookings.some((b) => {
    if (excludeId && b.id === excludeId) return false;
    const bDate = bookingDateIso(b);
    const bTime = String(b.time || b.startTime || '').trim();
    return bDate === dateIso && bTime === timeLabel;
  });
}

export function getTakenTimesForDate(department, dateIso) {
  return readDepartmentBookings(department)
    .filter((b) => bookingDateIso(b) === dateIso)
    .map((b) => String(b.time || b.startTime || '').trim())
    .filter(Boolean);
}

/** Atomically reserve a slot in localStorage; returns false if already taken. */
export function tryReserveDepartmentSlot(department, booking) {
  const dateIso = normalizeBookingDate(booking.dateIso || booking.date);
  const timeLabel = String(booking.time || '').trim();
  if (!dateIso || !timeLabel) return false;
  if (isSlotTaken(department, dateIso, timeLabel)) return false;

  const existing = readDepartmentBookings(department);
  writeDepartmentBookings(department, [...existing, { ...booking, dateIso }]);
  return true;
}
