import styled from 'styled-components';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

/* Matches the system's status badge style */
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid;

  ${({ $status }) => {
    switch ($status) {
      case 'Pending':
        return `
          background-color: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        `;
      case 'Paid':
        return `
          background-color: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
        `;
      case 'Cancelled':
        return `
          background-color: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        `;
      default:
        return `
          background-color: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        `;
    }
  }}
`;

const InvoiceStatusBadge = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'Pending':   return <Clock size={13} />;
      case 'Paid':      return <CheckCircle2 size={13} />;
      case 'Cancelled': return <XCircle size={13} />;
      default:          return null;
    }
  };

  return (
    <Badge $status={status}>
      {getIcon()}
      {status}
    </Badge>
  );
};

export default InvoiceStatusBadge;
