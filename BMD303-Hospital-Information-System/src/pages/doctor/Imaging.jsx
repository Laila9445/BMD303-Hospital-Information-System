import styled from 'styled-components';
import Card, { CardHeader, CardBody } from '../../components/common/Card';

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

const Imaging = () => {
  return (
    <PageContainer>
      <Header>
        <h1>Medical Imaging & Lab Tests</h1>
        <p>View medical imaging and laboratory test results</p>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>Medical Images List</h3>
        </CardHeader>
        <CardBody>
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            📷
            <h3 style={{ margin: '16px 0 8px 0' }}>No medical images yet</h3>
            <p>Medical images and lab tests will be displayed here when uploaded</p>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default Imaging;
