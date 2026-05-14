import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  EyeIcon,
  TrophyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%);
  color: #f9fafb;
  padding: 40px 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
`;

const Title = styled.h1`
  font-size: 42px;
  margin-bottom: 16px;
  color: #ffffff;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #9ca3af;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const IntroSection = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 60px;
  border: 1px solid #1e293b;
`;

const IntroTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: #38bdf8;
`;

const IntroText = styled.p`
  font-size: 16px;
  color: #d1d5db;
  line-height: 1.8;
  margin-bottom: 16px;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
`;

const ValueCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #1e293b;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: #38bdf8;
    box-shadow: 0 12px 32px rgba(56, 189, 248, 0.15);
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(56, 189, 248, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #38bdf8;
`;

const CardTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 12px;
  color: #ffffff;
`;

const CardDescription = styled.p`
  font-size: 15px;
  color: #9ca3af;
  line-height: 1.7;
`;

const StorySection = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 60px;
  border: 1px solid #1e293b;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 24px;
  color: #38bdf8;
`;

const SectionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextColumn = styled.div`
  p {
    font-size: 16px;
    color: #d1d5db;
    line-height: 1.8;
    margin-bottom: 16px;
  }
`;

const ImageColumn = styled.div`
  background: rgba(56, 189, 248, 0.05);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #1e293b;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
`;

const StatCard = styled.div`
  background: rgba(56, 189, 248, 0.05);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #1e293b;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const BackLink = styled(Link)`
  display: inline-block;
  padding: 12px 28px;
  border-radius: 999px;
  border: 1px solid #38bdf8;
  color: #e0f2fe;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(56, 189, 248, 0.18);
    transform: translateX(-4px);
  }
`;

const About = () => {
  const values = [
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: "Patient-Centered Care",
      description: "Every patient receives personalized attention and treatment plans tailored to their specific needs and goals."
    },
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      title: "Excellence in Treatment",
      description: "We maintain the highest standards of medical care and continuously adopt the latest advances in orthopedics."
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "Expert Team",
      description: "Our specialists are board-certified orthopedic surgeons and healthcare professionals with years of experience."
    },
    
  ];

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>About Us</Title>
          <Subtitle>
            Your trusted partner in orthopedic health. We're dedicated to 
            providing exceptional care and improving your quality of life.
          </Subtitle>
        </Header>

        <IntroSection>
          <IntroTitle>Who We Are</IntroTitle>
          <IntroText>
            Welcome to our Orthopedic Clinic, where compassion meets expertise. we have been at the forefront of orthopedic care, serving thousands of patients with 
            dedication and excellence. Our clinic is a beacon of hope for those suffering from 
            musculoskeletal conditions, offering comprehensive solutions from diagnosis to full recovery.
          </IntroText>
          
        </IntroSection>

        <ValuesGrid>
          {values.map((value, index) => (
            <ValueCard key={index}>
              <IconWrapper>
                {value.icon}
              </IconWrapper>
              <CardTitle>{value.title}</CardTitle>
              <CardDescription>{value.description}</CardDescription>
            </ValueCard>
          ))}
        </ValuesGrid>

 

        <div style={{ textAlign: 'center' }}>
          <BackLink to="/">Back to Home</BackLink>
        </div>
      </Container>
    </Wrapper>
  );
};

export default About;

