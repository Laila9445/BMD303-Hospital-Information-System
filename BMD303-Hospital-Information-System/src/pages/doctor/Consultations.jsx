import { useState, useEffect } from 'react';
import styled from 'styled-components';
import doctorService from '../../api/doctorService';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer>
      <Header>
        <h1>Medical Consultations</h1>
        <p>Manage patient medical consultations</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Consultation List</h3>
        </CardHeader>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <ClipboardDocumentIcon style={{ width: '80px', height: '80px', margin: '0 auto 16px', color: '#d1d5db' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>No consultations yet</h3>
            <p>You can start a new consultation from patient appointments</p>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Consultations;
