import styled from 'styled-components';

/* Matches Doctor/Nurse module StatCard design exactly */
const CardWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $bgColor }) => $bgColor || '#eff6ff'};
  color: ${({ $color }) => $color || '#2563eb'};
  flex-shrink: 0;
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const ValueText = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 3px;
`;

const TitleText = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const SubtitleText = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
`;

const TrendText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const StatsCard = ({ title, value, subtitle, icon, trend, iconBgColor, iconColor }) => {
  return (
    <CardWrapper>
      {icon && (
        <IconWrapper $bgColor={iconBgColor} $color={iconColor}>
          {icon}
        </IconWrapper>
      )}
      <InfoBlock>
        <TitleText>{title}</TitleText>
        <ValueText>{value}</ValueText>
        {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
        {trend && <TrendText>{trend}</TrendText>}
      </InfoBlock>
    </CardWrapper>
  );
};

export default StatsCard;
