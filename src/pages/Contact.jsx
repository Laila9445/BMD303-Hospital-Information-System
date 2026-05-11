import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
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

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
`;

const ContactCard = styled(Link)`
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #1e293b;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  display: block;

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

const CardText = styled.p`
  font-size: 16px;
  color: #9ca3af;
  line-height: 1.7;
  margin-bottom: 8px;
`;

const InfoSection = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 24px;
  color: #38bdf8;
  text-align: center;
`;

const LocationWrapper = styled.div`
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
`;

const LocationInfo = styled.div`
  flex: 1;
  min-width: 300px;
`;

const LocationMap = styled.div`
  background: rgba(56, 189, 248, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #1e293b;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
  }
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
`;

const DetailIcon = styled.div`
  color: #38bdf8;
  flex-shrink: 0;
`;

const DetailContent = styled.div`
  h4 {
    font-size: 16px;
    color: #ffffff;
    margin-bottom: 4px;
  }
  p {
    font-size: 15px;
    color: #9ca3af;
    line-height: 1.6;
  }
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

const Contact = () => {
  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>Contact Us</Title>
          <Subtitle>
            Get in touch with our team. We're here to answer your questions 
            and provide the care you need.
          </Subtitle>
        </Header>

        <ContactGrid>
          <ContactCard href="tel:+201003552925">
            <IconWrapper>
              <PhoneIcon className="w-8 h-8" />
            </IconWrapper>
            <CardTitle>Phone</CardTitle>
            <CardText>+201003552925</CardText>
            <CardText>Main Clinic Line</CardText>
          </ContactCard>

          <ContactCard href="mailto:OrthoClinic@gmail.com">
            <IconWrapper>
              <EnvelopeIcon className="w-8 h-8" />
            </IconWrapper>
            <CardTitle>Email</CardTitle>
            <CardText>OrthoClinic@gmail.com</CardText>
            <CardText>General Inquiries</CardText>
          </ContactCard>

          <ContactCard href="https://www.bing.com/maps/directions?FORM=HDRSC6&style=r&rtp=pos.29.95714569091797_30.92168426513672_Central%2520Spine%252C%2520Bldg.%2520306%252C%25204th%2520District%252C%2520GIZA_Dr.%2520Ahmed%2520Nabil%2520Emara_%7Epos.29.95714569091797_30.92168426513672_Central%2520Spine%252C%2520Bldg.%2520306%252C%25204th%2520District%252C%2520GIZA_Dr.%2520Ahmed%2520Nabil%2520Emara_&cp=29.957146%7E30.921684&lvl=21" target="_blank" rel="noopener noreferrer">
            <IconWrapper>
              <MapPinIcon className="w-8 h-8" />
            </IconWrapper>
            <CardTitle>Clinic Location</CardTitle>
            <CardText>Central Spine, Bldg. 306</CardText>
            <CardText>4th District, GIZA</CardText>
          </ContactCard>
        </ContactGrid>



        <div style={{ textAlign: 'center' }}>
          <BackLink to="/">Back to Home</BackLink>
        </div>
      </Container>
    </Wrapper>
  );
};

export default Contact;

