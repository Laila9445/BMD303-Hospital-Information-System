import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid ${({ $hasError }) => ($hasError ? '#dc2626' : '#e5e7eb')};
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? '#dc2626' : '#2563eb')};
    box-shadow: 0 0 0 3px ${({ $hasError }) => ($hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)')};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

export const InputWithLabel = ({ 
  label, 
  error, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name,
  required = false,
  disabled = false,
  children,
  ...props 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label 
          style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 500,
            color: '#374151',
            fontSize: '14px'
          }}
        >
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      {children ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '15px',
            border: `2px solid ${error ? '#dc2626' : '#e5e7eb'}`,
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          {...props}
        >
          {children}
        </select>
      ) : (
        <Input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          $hasError={!!error}
          disabled={disabled}
          {...props}
        />
      )}
      {error && (
        <p style={{ 
          color: '#dc2626', 
          fontSize: '13px', 
          marginTop: '6px',
          margin: '6px 0 0 0'
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export const SelectWithLabel = InputWithLabel;

export default Input;
