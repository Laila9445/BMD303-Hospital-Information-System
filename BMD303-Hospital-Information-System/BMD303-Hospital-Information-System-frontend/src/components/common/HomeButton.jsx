import { useNavigate } from 'react-router-dom';
import Button from './Button';

/**
 * A small helper button to return to the home page.
 * Use it in dashboard pages or any page where quick nav to home is desired.
 */
const HomeButton = ({ label = 'Home' }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="small"
      onClick={() => navigate('/')}
      style={{ marginBottom: '16px' }}
    >
      {label}
    </Button>
  );
};

export default HomeButton;
