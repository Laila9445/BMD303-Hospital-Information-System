import { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import consultationService from '../../api/consultationService';
import { getApiErrorMessage } from '../../api/apiUtils';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
`;

const Consultations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await consultationService.getDoctorPending();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load consultations'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async (appointmentId) => {
    try {
      await consultationService.startConsultation(appointmentId);
      toast.success('Consultation started');
      load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to start consultation'));
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>Medical Consultations</h1>
        <p>Today&apos;s scheduled visits that still need a consultation started.</p>
      </Header>

      <Card>
        <CardBody>
          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#6b7280', margin: 0 }}>No pending consultations for today.</p>
          ) : (
            <List>
              {items.map((item) => (
                <Row key={item.appointmentId}>
                  <div>
                    <strong>{item.patientName}</strong>
                    <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                      {item.appointmentDate
                        ? new Date(item.appointmentDate).toLocaleDateString()
                        : '—'}{' '}
                      ·{' '}
                      {String(item.startTime || '').slice(0, 5)} –{' '}
                      {String(item.endTime || '').slice(0, 5)}
                    </div>
                    {item.reasonForVisit && (
                      <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                        {item.reasonForVisit}
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="primary" size="small" onClick={() => handleStart(item.appointmentId)}>
                    Start consultation
                  </Button>
                </Row>
              ))}
            </List>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Consultations;
