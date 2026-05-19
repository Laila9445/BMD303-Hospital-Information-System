import styled from 'styled-components';
import { formatCurrency } from '../../billing/billingUtils';
import ActionButton from './ActionButton';

/**
 * Reusable ServiceCard component for displaying service details
 * Used in service pricing management
 */

const CardWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: ${({ $compact }) => ($compact ? '16px' : '20px')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const ServiceName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const DeptText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 3px 0 0 0;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  background-color: ${({ $active }) => ($active ? '#ecfdf5' : '#fef2f2')};
  color: ${({ $active }) => ($active ? '#059669' : '#dc2626')};
`;

const PriceSection = styled.div`
  padding: 10px 0 12px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 10px;
`;

const PriceLabel = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
`;

const PriceValue = styled.p`
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 3px 0 0 0;
`;

const Description = styled.p`
  font-size: 12px;
  color: #4b5563;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
`;

const ServiceCard = ({
  service,
  onClick,
  onEdit,
  onToggleStatus,
  onDelete,
  compact = false,
}) => {
  return (
    <CardWrapper $compact={compact} $clickable={!!onClick} onClick={onClick}>
      <CardTop>
        <div style={{ flex: 1 }}>
          <ServiceName>{service.serviceName}</ServiceName>
          <DeptText>{service.department}</DeptText>
        </div>
        <StatusBadge $active={service.activeStatus}>
          {service.activeStatus ? 'Active' : 'Inactive'}
        </StatusBadge>
      </CardTop>

      <PriceSection>
        <PriceLabel>Price</PriceLabel>
        <PriceValue>{formatCurrency(service.price)}</PriceValue>
      </PriceSection>

      {service.description && <Description>{service.description}</Description>}

      <ActionsRow>
        {onEdit && (
          <ActionButton
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            Edit
          </ActionButton>
        )}
        {onToggleStatus && (
          <ActionButton
            variant={service.activeStatus ? 'warning' : 'success'}
            size="sm"
            style={{ flex: 1 }}
            onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
          >
            {service.activeStatus ? 'Deactivate' : 'Activate'}
          </ActionButton>
        )}
        {onDelete && (
          <ActionButton
            variant="danger"
            size="sm"
            style={{ flex: 1 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            Delete
          </ActionButton>
        )}
      </ActionsRow>
    </CardWrapper>
  );
};

export default ServiceCard;
