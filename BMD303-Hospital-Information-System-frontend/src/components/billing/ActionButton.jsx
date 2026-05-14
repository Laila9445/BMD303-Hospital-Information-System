import styled from 'styled-components';

/**
 * Reusable ActionButton component for the billing module.
 * Uses styled-components — no external Button dependency.
 */

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  /* Size variants */
  padding: ${({ size }) => {
    if (size === 'small' || size === 'sm') return '6px 12px';
    if (size === 'large' || size === 'lg') return '10px 22px';
    return '8px 16px'; /* medium (default) */
  }};
  font-size: ${({ size }) => {
    if (size === 'small' || size === 'sm') return '12px';
    if (size === 'large' || size === 'lg') return '15px';
    return '13px';
  }};
  min-width: ${({ minWidth }) => minWidth || 'auto'};

  /* Color variants */
  background-color: ${({ variant, disabled }) => {
    if (disabled) return '#e5e7eb';
    switch (variant) {
      case 'primary':   return '#2563eb';
      case 'success':   return '#059669';
      case 'danger':    return '#dc2626';
      case 'warning':   return '#f59e0b';
      case 'secondary': return '#6b7280';
      case 'ghost':
      case 'outline':   return 'transparent';
      default:          return '#2563eb';
    }
  }};

  color: ${({ variant, disabled }) => {
    if (disabled) return '#9ca3af';
    if (variant === 'ghost' || variant === 'outline') return '#374151';
    return '#ffffff';
  }};

  border: ${({ variant }) =>
    variant === 'outline' || variant === 'ghost'
      ? '1px solid #d1d5db'
      : '1px solid transparent'};

  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'primary':   return '#1d4ed8';
        case 'success':   return '#047857';
        case 'danger':    return '#b91c1c';
        case 'warning':   return '#d97706';
        case 'secondary': return '#4b5563';
        case 'ghost':
        case 'outline':   return '#f3f4f6';
        default:          return '#1d4ed8';
      }
    }};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Spinner = styled.span`
  display: inline-flex;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ActionButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  minWidth,
  ...props
}) => {
  return (
    <StyledButton
      type={type}
      size={size}
      variant={variant}
      disabled={disabled || isLoading}
      minWidth={minWidth}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {children}
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default ActionButton;
