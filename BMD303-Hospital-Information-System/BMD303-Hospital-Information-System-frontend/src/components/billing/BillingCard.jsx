import styled from 'styled-components';

const CardWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const TitleText = styled.p`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
`;

const ValueText = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 6px 0 0 0;
`;

const NoteText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 3px 0 0 0;
`;

const BillingCard = ({ title, value, note, action }) => {
  return (
    <CardWrapper>
      <CardHeaderRow>
        <div>
          <TitleText>{title}</TitleText>
          <ValueText>{value}</ValueText>
          {note && <NoteText>{note}</NoteText>}
        </div>
        {action && <div>{action}</div>}
      </CardHeaderRow>
    </CardWrapper>
  );
};

export default BillingCard;
