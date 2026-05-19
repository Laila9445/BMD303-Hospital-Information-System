import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%);
  color: #f9fafb;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 34px;
  margin-bottom: 16px;
`;

const Text = styled.p`
  max-width: 640px;
  margin-bottom: 32px;
  color: #e5e7eb;
  line-height: 1.6;
`;

const BackLink = styled(Link)`
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid #38bdf8;
  color: #e0f2fe;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover {
    background-color: rgba(56, 189, 248, 0.18);
  }
`;

const Patients = () => {
  return (
    <Wrapper>
      <Title>Information for Patients</Title>
      <Text>
        Use this page to explain how patients can prepare for visits, access the portal,
        and manage appointments, records, and follow‑up care.
      </Text>
      <BackLink to="/">Back to Home</BackLink>
    </Wrapper>
  );
};

export default Patients;

