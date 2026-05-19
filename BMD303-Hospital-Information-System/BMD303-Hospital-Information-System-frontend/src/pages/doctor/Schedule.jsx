import { useState, useEffect } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { InputWithLabel } from '../../components/common/Input';
import { ClockIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { normalizeScheduleList, formatDayOfWeekLabel } from '../../utils/doctorUtils';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
`;

const ScheduleItem = styled.div`
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2563eb;
    background-color: #eff6ff;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
  }
  
  .details {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #6b7280;
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getSchedules();
      setSchedules(normalizeScheduleList(data));
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await doctorService.createSchedule(formData);
      toast.success('Schedule added successfully');
      loadSchedules();
      // Reset form if needed
    } catch (error) {
      toast.error('Failed to add schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await doctorService.deleteSchedule(scheduleId);
      toast.success('Schedule deleted successfully');
      loadSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const getDayName = (day) => formatDayOfWeekLabel(day) || day;

  return (
    <PageContainer>
      <Header>
        <h1>Schedule</h1>
        <p>Manage available working hours</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Added Schedules ({schedules.length})</h3>
        </CardHeader>
          <CardBody>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Loading...
              </div>
            ) : schedules.length > 0 ? (
              schedules.map((schedule) => (
                <ScheduleItem key={schedule.scheduleId}>
                  <div className="header">
                    <h4>{getDayName(schedule.dayOfWeek)}</h4>
                    <Button 
                      size="small" 
                      variant="danger"
                      onClick={() => handleDelete(schedule.scheduleId)}
                    >
                      <TrashIcon style={{ width: '18px', height: '18px' }} />
                    </Button>
                  </div>
                  <div className="details">
                    <span>
                      <ClockIcon style={{ width: '18px', height: '18px' }} />
                      {schedule.startTime?.substring(0, 5)} - {schedule.endTime?.substring(0, 5)}
                    </span>
                    <span>
                      ⏱️ {schedule.slotDurationMinutes} min per slot
                    </span>
                  </div>
                </ScheduleItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No schedules added yet
              </div>
            )}
          </CardBody>
        </Card>
    </PageContainer>
  );
};

export default DoctorSchedule;
