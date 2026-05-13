import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InputWithLabel } from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { validateRegistration } from '../../utils/validation';

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
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
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

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'Doctor',
    gender: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    // Use backend validation rules
    const validationErrors = validateRegistration(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      
      // Show validation errors as toast messages
      Object.values(validationErrors).forEach(error => {
        toast.error(error);
      });
      return;
    }

    try {
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      console.log('Attempting registration with data:', { ...registerData, password: '[HIDDEN]' });
      const result = await register(registerData);
      console.log('Registration result:', result);
      
      if (result.success) {
        toast.success('Account created successfully!');
        
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
        toast.error(result.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <h1>🏥 Orthopedic Clinic</h1>
          <p>Create New Account</p>
        </Header>

        <Form onSubmit={handleSubmit}>
          <TwoColumns>
            <InputWithLabel
              label="First Name"
              name="firstName"
              placeholder="Laila"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />

            <InputWithLabel
              label="Last Name"
              name="lastName"
              placeholder="Mohamed"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </TwoColumns>

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
            label="Phone Number"
            name="phoneNumber"
            placeholder="01234567890 or +201234567890"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            required
          />

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 500,
              color: '#374151',
              fontSize: '14px'
            }}>
              Role <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
              <option value="Nurse">Nurse</option>
              <option value="Physiotherapist">Physiotherapist</option>
              <option value="Radiologist">Radiologist</option>
            </select>
          </div>

          <TwoColumns>
            <InputWithLabel
              label="Password"
              type="password"
              name="password"
              placeholder="Min 8 chars: Aa1@xxxx"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <InputWithLabel
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </TwoColumns>

          <TwoColumns>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 500,
                color: '#374151',
                fontSize: '14px'
              }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <InputWithLabel
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </TwoColumns>

          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>

        <FooterText>
          Already have an account? <Link to="/login">Sign In</Link>
        </FooterText>
      </Card>
    </Container>
  );
};

export default Register;
