import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image:
    linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)),
    url('/orthopedic-clinic-hero.jpg.png');
  background-size: cover;
  background-position: center;
  color: #ffffff;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 56px;

  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const Brand = styled.div`
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e0f2fe;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 32px;
  font-size: 14px;

  a {
    color: #e5e7eb;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;

    &:hover {
      color: #ffffff;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const OutlineButton = styled(Link)`
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid #ffffff;
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }
`;

const SolidButton = styled(Link)`
  padding: 8px 18px;
  border-radius: 999px;
  background-color: #0ea5e9;
  color: #0f172a;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: none;

  &:hover {
    background-color: #38bdf8;
  }
`;

const Hero = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 40px 56px 72px;

  @media (max-width: 768px) {
    padding: 32px 20px 56px;
  }
`;

const HeroContent = styled.div`
  max-width: 560px;
`;

const HeroEyebrow = styled.p`
  font-size: 15px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #d1d5db;
  margin-bottom: 10px;
`;

const HeroTitle = styled.h1`
  font-size: 44px;
  line-height: 1.1;
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #e5e7eb;
  max-width: 460px;
  margin-bottom: 28px;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const Home = () => {
  return (
    <PageWrapper>
      <TopBar>
        <Brand>Orthopedic Clinic</Brand>

        <NavLinks>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/about">About Us</Link>
          <Link to="/patients">Patients</Link>
        </NavLinks>
      </TopBar>

      <Hero>
        <HeroContent>
          <HeroEyebrow>Orthopedics</HeroEyebrow>
          <HeroTitle>Entrust your health with us</HeroTitle>
          <HeroSubtitle>
            Comprehensive orthopedic care for patients and doctors, with secure access
            to appointments, records, and more.
          </HeroSubtitle>

          <HeroActions>
            <SolidButton to="/login">Login</SolidButton>
            <OutlineButton to="/register">Sign Up</OutlineButton>
          </HeroActions>
        </HeroContent>
      </Hero>
    </PageWrapper>
  );
};

export default Home;

