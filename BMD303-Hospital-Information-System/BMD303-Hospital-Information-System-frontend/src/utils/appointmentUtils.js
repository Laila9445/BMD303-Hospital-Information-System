/**
 * Shared appointment slot helpers (API may return PascalCase or camelCase).
 */

export const normalizeTimeSlot = (slot) => ({
  timeSlotId: slot.timeSlotId ?? slot.TimeSlotId,
  slotDate: String(slot.slotDate ?? slot.SlotDate ?? '').split('T')[0],
  startTime: String(slot.startTime ?? slot.StartTime ?? ''),
  endTime: String(slot.endTime ?? slot.EndTime ?? ''),
  status: slot.status ?? slot.Status ?? 'Available',
});

export const isSlotAvailable = (status) =>
  String(status || 'available').toLowerCase() === 'available';

export const formatSlotTime = (time) => {
  if (!time) return '';
  return String(time).slice(0, 5);
};

export const formatSlotOptionLabel = (slot) =>
  `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}`;

export const filterSlotsForDate = (slots, date) =>
  (slots || [])
    .map(normalizeTimeSlot)
    .filter((slot) => {
      if (slot.slotDate && slot.slotDate !== date) return false;
      return isSlotAvailable(slot.status);
    });
