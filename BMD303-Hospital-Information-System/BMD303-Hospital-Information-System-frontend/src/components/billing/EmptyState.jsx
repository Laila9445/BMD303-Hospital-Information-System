import styled from 'styled-components';
import { FileText } from 'lucide-react';

const Wrapper = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 48px 24px;
  text-align: center;
  color: #9ca3af;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 12px 0 4px 0;
  }

  p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
`;

const EmptyState = ({ title, description, icon }) => {
  const Icon = icon || FileText;
  return (
    <Wrapper>
      <Icon size={28} color="#d1d5db" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </Wrapper>
  );
};

export default EmptyState;
