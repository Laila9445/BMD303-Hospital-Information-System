import styled from 'styled-components';

const Spinner = styled.div`
  border: 3px solid ${({ $light }) => ($light ? 'rgba(255, 255, 255, 0.3)' : '#e5e7eb')};
  border-top: 3px solid ${({ $light }) => ($light ? '#ffffff' : '#2563eb')};
  border-radius: 50%;
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingOverlay = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Spinner size="60px" $light />
    </div>
  );
};

export default Spinner;
