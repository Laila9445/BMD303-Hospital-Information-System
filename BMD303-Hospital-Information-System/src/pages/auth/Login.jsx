import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InputWithLabel } from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%);
  padding: 20px;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px;
  width: 100%;
  max-width: 480px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const Form = styled.form`
  // Form styling
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
  
  a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        
        // Redirect based on role
        if (result.user.role === 'Doctor') {
          navigate('/doctor/dashboard');
        } else if (result.user.role === 'Nurse') {
          navigate('/nurse/dashboard');
        } else if (result.user.role === 'Physiotherapist') {
          navigate('/physio/staff');
        } else if (result.user.role === 'Radiologist') {
          navigate('/radiology/staff');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        toast.error(result.message || 'Login failed');
        setErrors({ email: result.message || 'Invalid credentials' });
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setErrors({ email: 'A connection error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <h1> Orthopedic Clinic</h1>
          <p>Sign in to your account</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputWithLabel
            label="Email Address"
            type="email"
            name="email"
            placeholder="username@gmail.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <InputWithLabel
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <FooterText>
          Don't have an account? <Link to="/register">Create Account</Link>
        </FooterText>
      </Card>
    </Container>
  );
};

export default Login;



