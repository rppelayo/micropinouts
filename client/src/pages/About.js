import React from 'react';
import styled from 'styled-components';
import { Info, Calendar, Users, Cpu, BookOpen, Globe, Heart, Zap } from 'lucide-react';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 120px 20px 40px;
  line-height: 1.6;
  color: #374151;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 40px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Paragraph = styled.p`
  margin-bottom: 16px;
  color: #4b5563;
`;

const List = styled.ul`
  margin: 16px 0;
  padding-left: 24px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  color: #4b5563;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 24px 0;
`;

const FeatureCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
`;

const FeatureIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  color: #64748b;
  font-size: 0.9rem;
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  margin: 24px 0;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 16px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

const ContactSection = styled.div`
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  text-align: center;
`;

const About = () => {
  return (
    <AboutContainer>
      <Title>
        <Info size={32} />
        About MicroPinouts
      </Title>
      
      <Subtitle>
        Your comprehensive resource for microcontroller pinout diagrams and electronics education
      </Subtitle>

      <Section>
        <SectionTitle>
          <Globe size={24} />
          What is MicroPinouts?
        </SectionTitle>
        <Paragraph>
          MicroPinouts is an educational web application dedicated to providing interactive pinout diagrams and comprehensive resources for microcontrollers, sensors, and development boards. Our mission is to make electronics education more accessible and engaging for students, hobbyists, and professional engineers.
        </Paragraph>
        <Paragraph>
          Whether you're building your first Arduino project, working with ESP32 modules, or exploring Raspberry Pi applications, MicroPinouts provides the visual tools and information you need to understand hardware connections and pin configurations.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Zap size={24} />
          Key Features
        </SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <Cpu size={24} />
            </FeatureIcon>
            <FeatureTitle>Interactive Pinout Diagrams</FeatureTitle>
            <FeatureDescription>
              Detailed, interactive diagrams showing pin functions, voltages, and connections for popular microcontrollers and development boards.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <BookOpen size={24} />
            </FeatureIcon>
            <FeatureTitle>Educational Resources</FeatureTitle>
            <FeatureDescription>
              Comprehensive wiring guides, tutorials, and documentation to help you understand electronics concepts and best practices.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <Users size={24} />
            </FeatureIcon>
            <FeatureTitle>Community Driven</FeatureTitle>
            <FeatureDescription>
              Built with the electronics community in mind, featuring content from open-source repositories and community contributions.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <Globe size={24} />
            </FeatureIcon>
            <FeatureTitle>Free & Open Access</FeatureTitle>
            <FeatureDescription>
              All resources are freely available to support education and innovation in the electronics and maker communities.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section>
        <SectionTitle>
          <Calendar size={24} />
          Our Mission
        </SectionTitle>
        <HighlightBox>
          <Paragraph>
            <strong>To democratize electronics education</strong> by providing high-quality, accessible resources that help learners of all levels understand and work with microcontrollers and electronic components.
          </Paragraph>
          <Paragraph>
            We believe that understanding hardware connections shouldn't be a barrier to innovation. By providing clear, accurate, and comprehensive pinout information, we empower makers, students, and engineers to bring their ideas to life.
          </Paragraph>
        </HighlightBox>
      </Section>

      <Section>
        <SectionTitle>
          <Heart size={24} />
          Who We Serve
        </SectionTitle>
        <List>
          <ListItem><strong>Students</strong> - Learning electronics and programming in academic settings</ListItem>
          <ListItem><strong>Hobbyists</strong> - Building personal projects and exploring new technologies</ListItem>
          <ListItem><strong>Educators</strong> - Teaching electronics concepts and hands-on learning</ListItem>
          <ListItem><strong>Professional Engineers</strong> - Quick reference for hardware specifications and connections</ListItem>
          <ListItem><strong>Makers</strong> - Prototyping and building innovative electronic devices</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>
          <Cpu size={24} />
          Supported Platforms
        </SectionTitle>
        <Paragraph>
          MicroPinouts supports a wide range of popular microcontrollers and development boards, including:
        </Paragraph>
        <List>
          <ListItem>Arduino family (Uno, Nano, Pro Mini, Mega, and more)</ListItem>
          <ListItem>ESP32 and ESP8266 series</ListItem>
          <ListItem>Raspberry Pi models</ListItem>
          <ListItem>Teensy microcontrollers</ListItem>
          <ListItem>Adafruit Feather and Circuit Playground boards</ListItem>
          <ListItem>SparkFun development boards</ListItem>
          <ListItem>And many more from the maker community</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>
          <Globe size={24} />
          Open Source & Community
        </SectionTitle>
        <Paragraph>
          MicroPinouts is built on the foundation of open-source principles and community collaboration. We utilize publicly available Fritzing parts and diagrams from the electronics community, ensuring that our resources are both comprehensive and legally compliant.
        </Paragraph>
        <Paragraph>
          We believe in giving back to the community that makes projects like this possible, and we're committed to maintaining transparency about our sources and licensing.
        </Paragraph>
      </Section>

      <ContactSection>
        <SectionTitle>
          <Heart size={24} />
          Get Involved
        </SectionTitle>
        <Paragraph>
          Have feedback, suggestions, or want to contribute to MicroPinouts? We'd love to hear from you!
        </Paragraph>
        <Paragraph>
          <strong>Contact us:</strong> For general inquiries, technical support, or collaboration opportunities, reach out to our team.
        </Paragraph>
        <Paragraph>
          <strong>Report Issues:</strong> Found an error in a pinout diagram or have suggestions for improvement? Let us know so we can make MicroPinouts even better.
        </Paragraph>
      </ContactSection>

      <Section>
        <SectionTitle>
          <Calendar size={24} />
          Last Updated
        </SectionTitle>
        <Paragraph>
          This page was last updated in October 2025. MicroPinouts is continuously evolving to better serve the electronics community.
        </Paragraph>
      </Section>
    </AboutContainer>
  );
};

export default About;

