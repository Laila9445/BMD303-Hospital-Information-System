import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { InputWithLabel, SelectWithLabel } from '../common/Input';
import appointmentService from '../../api/appointmentService';
import doctorService from '../../api/doctorService';
import { getReferralId } from '../../utils/referralUtils';
import { getApiErrorMessage, unwrapList } from '../../api/apiUtils';
import { useAuth } from '../../context/AuthContext';
import {
  resolveDoctorId,
  normalizeScheduleList,
  getNextDateForScheduleDays,
  DEFAULT_WEEKDAY_SCHEDULE,
  formatScheduleDaysSummary,
} from '../../utils/doctorUtils';
import { filterSlotsForDate, formatSlotOptionLabel } from '../../utils/appointmentUtils';

const getWeekdayName = (dateStr) => {
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return 'that day';
  }
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const Panel = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: min(480px, 92vw);
  max-height: 90vh;
  overflow-y: auto;
`;

const HelpBox = styled.div`
  margin-top: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
`;

const ReferralBookAppointmentModal = ({
  referral,
  isOpen,
  onClose,
  onBooked,
  useStaffSchedule = false,
  department = 'Radiology',
}) => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [scheduleDoctorId, setScheduleDoctorId] = useState(null);
  const [resolvingDoctor, setResolvingDoctor] = useState(false);
  const [scheduleDays, setScheduleDays] = useState(DEFAULT_WEEKDAY_SCHEDULE);

  const referralId = getReferralId(referral);
  const referringDoctorName =
    referral?.doctorName || (referral?.doctorId ? `Doctor #${referral.doctorId}` : 'referring doctor');
  const patientId = referral?.patientId;

  const staffLabel = department === 'Physiotherapy' ? 'physiotherapist' : 'radiologist';

  useEffect(() => {
    if (!isOpen) return;

    setTimeSlotId('');
    setSlots([]);

    const resolveScheduleDoctor = async () => {
      setResolvingDoctor(true);
      try {
        if (useStaffSchedule) {
          const staffDoctorId = await resolveDoctorId(user);
          if (staffDoctorId) {
            setScheduleDoctorId(staffDoctorId);
            try {
              const schedules = normalizeScheduleList(await doctorService.getSchedules());
              const days = schedules.length ? schedules : DEFAULT_WEEKDAY_SCHEDULE;
              setScheduleDays(days);
              setAppointmentDate(
                getNextDateForScheduleDays(days) || new Date().toISOString().split('T')[0]
              );
            } catch {
              setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
              setAppointmentDate(
                getNextDateForScheduleDays(DEFAULT_WEEKDAY_SCHEDULE) ||
                  new Date().toISOString().split('T')[0]
              );
            }
            return;
          }
          toast.error(
            `No ${staffLabel} schedule profile found. Add working hours under your schedule.`
          );
          setScheduleDoctorId(null);
          setAppointmentDate('');
          return;
        }
        setScheduleDoctorId(referral?.doctorId ?? null);
        setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
        setAppointmentDate(
          getNextDateForScheduleDays(DEFAULT_WEEKDAY_SCHEDULE) ||
            new Date().toISOString().split('T')[0]
        );
      } finally {
        setResolvingDoctor(false);
      }
    };

    resolveScheduleDoctor();
  }, [isOpen, referralId, useStaffSchedule, user, referral?.doctorId, staffLabel]);

  const loadSlots = useCallback(
    async (date) => {
      if (!scheduleDoctorId || !date) {
        setSlots([]);
        return;
      }

      setLoadingSlots(true);
      setTimeSlotId('');
      try {
        const data = await appointmentService.getAvailableSlots(scheduleDoctorId, date, date);
        setSlots(filterSlotsForDate(unwrapList(data), date));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load time slots'));
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [scheduleDoctorId]
  );

  useEffect(() => {
    if (!isOpen || !appointmentDate || scheduleDoctorId == null) return;
    loadSlots(appointmentDate);
  }, [isOpen, appointmentDate, scheduleDoctorId, loadSlots]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!timeSlotId) {
      toast.error('Select a time slot');
      return;
    }
    if (!patientId) {
      toast.error('Patient information is missing on this referral');
      return;
    }
    if (!scheduleDoctorId) {
      toast.error('No schedule provider available for booking');
      return;
    }

    setLoading(true);
    try {
      await appointmentService.bookAppointment({
        doctorId: Number(scheduleDoctorId),
        patientId: Number(patientId),
        timeSlotId: Number(timeSlotId),
        referralId: Number(referralId),
        reasonForVisit: referral?.reason || 'Referral visit',
      });
      toast.success('Appointment booked. Referral status updated to Appointment Booked.');
      onBooked?.();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to book appointment'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !referral) return null;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Book appointment</h2>
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
          Patient: {referral.patientName || referral.patientId} · Referral #{referralId}
        </p>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: 14 }}>
          {useStaffSchedule ? (
            <>
              Slots use <strong>your {department.toLowerCase()} schedule</strong>. Referring doctor:{' '}
              {referringDoctorName}.
            </>
          ) : (
            <>
              Slots use <strong>{referringDoctorName}</strong> (referring doctor schedule).
            </>
          )}
        </p>

        {useStaffSchedule && !resolvingDoctor && !scheduleDoctorId && (
          <HelpBox>
            Add working hours under <strong>Schedule</strong> (Mon–Fri or your chosen days), then book again.
          </HelpBox>
        )}

        <form onSubmit={handleBook}>
          <InputWithLabel
            label="Appointment date"
            name="appointmentDate"
            type="date"
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              setTimeSlotId('');
            }}
            min={minDate}
            required
            disabled={!scheduleDoctorId || resolvingDoctor}
          />

          <SelectWithLabel
            label="Time slot"
            name="timeSlotId"
            value={timeSlotId}
            onChange={(e) => setTimeSlotId(e.target.value)}
            required
            disabled={loadingSlots || resolvingDoctor || !scheduleDoctorId}
          >
            <option value="">
              {resolvingDoctor
                ? 'Loading schedule...'
                : loadingSlots
                  ? 'Loading slots...'
                  : slots.length
                    ? 'Select a time slot'
                    : 'No slots on this date'}
            </option>
            {slots.map((slot) => (
              <option key={slot.timeSlotId} value={slot.timeSlotId}>
                {formatSlotOptionLabel(slot)}
              </option>
            ))}
          </SelectWithLabel>

          {!loadingSlots && !resolvingDoctor && scheduleDoctorId && slots.length === 0 && appointmentDate && (
            <HelpBox>
              <strong>No open slots for {getWeekdayName(appointmentDate)} ({appointmentDate}).</strong>
              <br />
              Working days: {formatScheduleDaysSummary(scheduleDays)}.
              {getNextDateForScheduleDays(scheduleDays) && (
                <>
                  <br />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    style={{ marginTop: 8 }}
                    onClick={() => setAppointmentDate(getNextDateForScheduleDays(scheduleDays))}
                  >
                    Use next working day
                  </Button>
                </>
              )}
            </HelpBox>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || loadingSlots || resolvingDoctor || !slots.length || !scheduleDoctorId}
              style={{ flex: 1 }}
            >
              {loading ? 'Booking...' : 'Confirm booking'}
            </Button>
          </div>
        </form>
      </Panel>
    </Overlay>
  );
};

export default ReferralBookAppointmentModal;