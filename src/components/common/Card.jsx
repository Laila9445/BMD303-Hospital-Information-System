import styled from 'styled-components';

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: ${({ size }) => (size === 'small' ? '16px' : size === 'large' ? '32px' : '24px')};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #6b7280;
  }
`;

export const CardBody = styled.div`
  // Body content styling
`;

export const CardFooter = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: ${({ align }) => align || 'flex-start'};
`;

export default Card;
