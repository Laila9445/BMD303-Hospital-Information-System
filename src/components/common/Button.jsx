import styled from 'styled-components';

const Button = styled.button`
  padding: ${({ size }) => (size === 'small' ? '8px 16px' : size === 'large' ? '14px 28px' : '10px 20px')};
  font-size: ${({ size }) => (size === 'small' ? '14px' : size === 'large' ? '16px' : '15px')};
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: ${({ minWidth }) => minWidth || 'auto'};
  
  background-color: ${({ variant, disabled }) => {
    if (disabled) return '#e5e7eb';
    switch (variant) {
      case 'primary':
        return '#2563eb'; // Blue
      case 'success':
        return '#16a34a'; // Green
      case 'danger':
        return '#dc2626'; // Red
      case 'warning':
        return '#f59e0b'; // Orange
      case 'secondary':
        return '#6b7280'; // Gray
      default:
        return '#2563eb';
    }
  }};
  
  color: ${({ disabled }) => (disabled ? '#9ca3af' : '#ffffff')};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'primary':
          return '#1d4ed8';
        case 'success':
          return '#15803d';
        case 'danger':
          return '#b91c1c';
        case 'warning':
          return '#d97706';
        case 'secondary':
          return '#4b5563';
        default:
          return '#1d4ed8';
      }
    }};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default Button;
