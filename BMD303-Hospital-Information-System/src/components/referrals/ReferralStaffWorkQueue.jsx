import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import referralService from '../../api/referralService';
import { getApiErrorMessage } from '../../api/apiUtils';
import { useAuth } from '../../context/AuthContext';
import { canActAsPhysiotherapist, canActAsRadiologist } from '../../utils/authUtils';
import { dedupeReferralsById, filterReferralsByDepartment, getReferralId } from '../../utils/referralUtils';
import ReferralBookAppointmentModal from './ReferralBookAppointmentModal';

const PageSection = styled.div``;

const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #374151;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  padding: 20px !important;
`;

const StatLabel = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
`;

const FilterRow = styled.div`
  margin-bottom: 16px;
`;

const TableCard = styled(Card)`
  padding: 0 !important;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 14px 24px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    padding: 16px 24px;
    font-size: 14px;
    border-bottom: 1px solid #f3f4f6;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $status }) => {
    if ($status === 'Pending') return '#fef3c7';
    if ($status === 'Accepted') return '#dbeafe';
    if ($status === 'Appointment Booked') return '#e0e7ff';
    if ($status === 'Completed') return '#dcfce7';
    if ($status === 'Cancelled') return '#fee2e2';
    return '#f3f4f6';
  }};
  color: ${({ $status }) => {
    if ($status === 'Pending') return '#92400e';
    if ($status === 'Accepted') return '#1e40af';
    if ($status === 'Appointment Booked') return '#3730a3';
    if ($status === 'Completed') return '#15803d';
    if ($status === 'Cancelled') return '#b91c1c';
    return '#374151';
  }};
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const ROLE_FOR_DEPARTMENT = {
  Physiotherapy: 'Physiotherapist',
  Radiology: 'Radiologist',
};

const referralStatusIs = (referral, expected) =>
  String(referral?.status || '')
    .trim()
    .toLowerCase() === String(expected).toLowerCase();

const ReferralStaffWorkQueue = ({ department, title, description }) => {
  const { user } = useAuth();
  const requiredRole = ROLE_FOR_DEPARTMENT[department];
  const isPhysioDept = department === 'Physiotherapy';
  /** API enforces role from JWT — profile role alone must not enable Accept/Book. */
  const hasStaffRole = isPhysioDept ? canActAsPhysiotherapist() : canActAsRadiologist();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingReferral, setBookingReferral] = useState(null);
  const [completingReferral, setCompletingReferral] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter || null;
      let data;
      try {
        data =
          department === 'Radiology'
            ? await referralService.getRadiologyReferrals(status)
            : await referralService.getPhysioReferrals(status);
      } catch (primaryError) {
        const fallback = await referralService.getMyReferrals(status);
        data = filterReferralsByDepartment(fallback, department);
        if (!data.length) throw primaryError;
      }
      const list = dedupeReferralsById(data);
      setReferrals(filterReferralsByDepartment(list, department));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load referrals'));
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, [department, statusFilter]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const counts = useMemo(
    () => ({
      pending: referrals.filter((r) => referralStatusIs(r, 'Pending')).length,
      accepted: referrals.filter((r) => referralStatusIs(r, 'Accepted')).length,
      booked: referrals.filter((r) => referralStatusIs(r, 'Appointment Booked')).length,
      completed: referrals.filter((r) => referralStatusIs(r, 'Completed')).length,
    }),
    [referrals]
  );

  const handleAccept = async (referral) => {
    if (!hasStaffRole) {
      toast.error(
        `Only a ${requiredRole} can accept ${department.toLowerCase()} referrals. Log out, then sign in with a ${requiredRole} account (not Doctor).`
      );
      return;
    }
    try {
      await referralService.updateReferralStatus(getReferralId(referral), { status: 'Accepted' });
      toast.success('Referral accepted');
      loadReferrals();
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      if (code === 'INVALID_STATUS_TRANSITION' || status === 403 || status === 401) {
        toast.error(
          `Only a logged-in ${requiredRole} can accept this referral. Doctors create referrals; log out and sign in as ${requiredRole} to accept or book.`
        );
      } else {
        toast.error(getApiErrorMessage(error, 'Failed to accept referral'));
      }
    }
  };

  const handleCancel = async (referral) => {
    const reason = window.prompt('Cancellation reason (required):');
    if (!reason?.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }
    try {
      await referralService.updateReferralStatus(getReferralId(referral), {
        status: 'Cancelled',
        cancellationReason: reason.trim(),
      });
      toast.success('Referral cancelled');
      loadReferrals();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel referral'));
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!completionNotes.trim()) {
      toast.error('Completion notes are required');
      return;
    }
    try {
      await referralService.updateReferralStatus(getReferralId(completingReferral), {
        status: 'Completed',
        completionNotes: completionNotes.trim(),
      });
      toast.success('Referral marked completed');
      setCompletingReferral(null);
      setCompletionNotes('');
      loadReferrals();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to complete referral'));
    }
  };

  return (
    <PageSection>
      <Header>
        <h1>{title}</h1>
        <p>{description}</p>
        {!hasStaffRole && user && (
          <p style={{ marginTop: 12, padding: 12, background: '#fef3c7', borderRadius: 8, color: '#92400e', fontSize: 14 }}>
            You are logged in as <strong>{user.role}</strong>. To accept referrals here, use an account with role{' '}
            <strong>{requiredRole}</strong> (register at Sign Up → {requiredRole}, then log in).
          </p>
        )}
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>Pending</StatLabel>
          <StatValue>{counts.pending}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Accepted</StatLabel>
          <StatValue>{counts.accepted}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Appointment booked</StatLabel>
          <StatValue>{counts.booked}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Completed</StatLabel>
          <StatValue>{counts.completed}</StatValue>
        </StatCard>
      </StatsGrid>

      <FilterRow>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Appointment Booked">Appointment Booked</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </FilterRow>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading referrals...</p>
      ) : referrals.length === 0 ? (
        <Card style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
          No {department.toLowerCase()} referrals in this queue.
        </Card>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => {
                const id = getReferralId(referral);

                return (
                  <tr key={id}>
                    <td>{referral.patientName || referral.patientExternalId || referral.patientId}</td>
                    <td>{referral.referralType || '—'}</td>
                    <td>{referral.reason || '—'}</td>
                    <td>{referral.urgency || 'Routine'}</td>
                    <td>
                      <StatusBadge $status={referral.status}>{referral.status}</StatusBadge>
                    </td>
                    <td>
                      <ActionRow>
                        {referralStatusIs(referral, 'Pending') && (
                          <>
                            <Button
                              type="button"
                              variant="primary"
                              size="small"
                              onClick={() => handleAccept(referral)}
                              disabled={!hasStaffRole}
                              title={!hasStaffRole ? `Requires ${requiredRole} role` : ''}
                            >
                              Accept
                            </Button>
                            <Button type="button" variant="secondary" size="small" onClick={() => handleCancel(referral)}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {referralStatusIs(referral, 'Accepted') && (
                          <Button type="button" variant="primary" size="small" onClick={() => setBookingReferral(referral)}>
                            Book appointment
                          </Button>
                        )}
                        {referralStatusIs(referral, 'Appointment Booked') && (
                          <Button type="button" variant="secondary" size="small" onClick={() => setCompletingReferral(referral)}>
                            Complete
                          </Button>
                        )}
                      </ActionRow>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableCard>
      )}

      <ReferralBookAppointmentModal
        referral={bookingReferral}
        isOpen={!!bookingReferral}
        onClose={() => setBookingReferral(null)}
        onBooked={loadReferrals}
        useStaffSchedule
        department={department}
      />

      {completingReferral && (
        <ModalOverlay onClick={() => setCompletingReferral(null)}>
          <Card style={{ padding: 24, width: 'min(440px, 92vw)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Complete referral</h3>
            <form onSubmit={handleComplete}>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Completion notes (required)"
                rows={4}
                style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                required
              />
              <ActionRow>
                <Button type="button" variant="secondary" onClick={() => setCompletingReferral(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Mark completed
                </Button>
              </ActionRow>
            </form>
          </Card>
        </ModalOverlay>
      )}
    </PageSection>
  );
};

export default ReferralStaffWorkQueue;
