import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon,
  PhotoIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  WrenchIcon
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
`;

const ServiceCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #1e293b;
  transition: all 0.3s ease;
  cursor: pointer;

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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
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

const Services = () => {
  const services = [
    {
      icon: <ClipboardDocumentListIcon className="w-8 h-8" />,
      title: "Diagnostic Services",
      description: "Comprehensive orthopedic diagnostics including physical examinations, gait analysis, joint assessments, and advanced diagnostic testing to accurately identify musculoskeletal conditions."
    },
    
    {
      icon: <WrenchIcon className="w-8 h-8" />,
      title: "Surgical Procedures",
      description: "Advanced orthopedic surgeries including joint replacement, arthroscopic procedures, fracture repair, sports injury surgery, and minimally invasive techniques."
    },
    
    {
      icon: <AcademicCapIcon className="w-8 h-8" />,
      title: "Physical Therapy",
      description: "Expert physical therapy services focusing on pain management, movement restoration, injury prevention, and customized exercise programs for long-term health."
    },
  
  ];

  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>Our Services</Title>
          <Subtitle>
            Comprehensive care for your bones, joints, ligaments, tendons, and muscles.
            We offer a complete range of orthopedic services under one roof.
          </Subtitle>
        </Header>

        <IntroSection>
          <IntroTitle>About Our Services</IntroTitle>
          <IntroText>
            Our orthopedic clinic provides world-class diagnostic, surgical, and rehabilitative care 
            for patients of all ages. With cutting-edge technology and experienced specialist, 
            we're committed to helping you regain mobility and live pain-free.
          </IntroText>
          <IntroText>
            From initial diagnosis through post-surgical rehabilitation, our integrated approach ensures 
            continuity of care. We work closely with referring physicians, physical therapists, and other 
            healthcare professionals to deliver the best possible outcomes for every patient.
          </IntroText>
        </IntroSection>

        <ServicesGrid>
          {services.map((service, index) => (
            <ServiceCard key={index}>
              <IconWrapper>
                {service.icon}
              </IconWrapper>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </ServiceCard>
          ))}
        </ServicesGrid>

        <div style={{ textAlign: 'center' }}>
          <BackLink to="/">Back to Home</BackLink>
        </div>
      </Container>
    </Wrapper>
  );
};

export default Services;

