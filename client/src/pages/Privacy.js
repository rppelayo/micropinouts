import React from 'react';
import styled from 'styled-components';
import { Shield, Calendar, Eye, Cookie, Target, Users, Lock, AlertTriangle, Mail, Globe } from 'lucide-react';

const PrivacyContainer = styled.div`
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

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 40px;
`;

const Section = styled.section`
  margin-bottom: 32px;
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

const SubSection = styled.div`
  margin: 16px 0;
`;

const SubSectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const InfoBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  color: #0c4a6e;
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  color: #92400e;
`;

const ContactInfo = styled.div`
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
`;

const ExternalLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
`;

const Privacy = () => {
  return (
    <PrivacyContainer>
      <Title>
        <Shield size={32} />
        Privacy Policy
      </Title>
      
      <LastUpdated>
        <Calendar size={16} />
        Last updated: October 2025
      </LastUpdated>

      <Section>
        <SectionTitle>
          <Globe size={24} />
          1. Introduction
        </SectionTitle>
        <Paragraph>
          Welcome to micropinouts.com, an educational website that provides interactive pinout diagrams and resources for microcontrollers and electronic components.
        </Paragraph>
        <Paragraph>
          This Privacy Policy explains how we collect, use, and protect your information when you visit or interact with our website.
          By using this site, you agree to the practices described below.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Eye size={24} />
          2. Information We Collect
        </SectionTitle>
        
        <SubSection>
          <SubSectionTitle>a. Non-Personal Information</SubSectionTitle>
          <Paragraph>
            When you visit micropinouts.com, we may automatically collect certain non-identifiable information such as:
          </Paragraph>
          <List>
            <ListItem>Browser type and version</ListItem>
            <ListItem>Device type and operating system</ListItem>
            <ListItem>Referring and exit pages</ListItem>
            <ListItem>Date and time of your visit</ListItem>
            <ListItem>Approximate geographic region (city or country)</ListItem>
            <ListItem>Pages viewed and time spent on the site</ListItem>
          </List>
          <Paragraph>
            This data is collected for analytics and site performance improvement purposes only.
          </Paragraph>
        </SubSection>

        <SubSection>
          <SubSectionTitle>b. Cookies and Similar Technologies</SubSectionTitle>
          <Paragraph>
            micropinouts.com uses cookies and similar technologies to:
          </Paragraph>
          <List>
            <ListItem>Analyze traffic and usage patterns</ListItem>
            <ListItem>Serve relevant advertisements</ListItem>
            <ListItem>Improve the browsing experience</ListItem>
          </List>
          <Paragraph>
            You can disable cookies through your browser settings, though some features may not work properly if cookies are turned off.
          </Paragraph>
        </SubSection>

        <SubSection>
          <SubSectionTitle>c. Advertising and Third-Party Cookies</SubSectionTitle>
          <Paragraph>
            We use Google AdSense and other ad networks to serve advertisements. These networks may use cookies or web beacons to:
          </Paragraph>
          <List>
            <ListItem>Display personalized ads based on your browsing activity</ListItem>
            <ListItem>Measure ad performance</ListItem>
            <ListItem>Prevent fraud or abuse</ListItem>
          </List>
          <InfoBox>
            Google uses the DoubleClick cookie to serve ads that are relevant to your interests. You can opt out of personalized advertising by visiting <ExternalLink href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Ads Settings</ExternalLink>.
          </InfoBox>
          <Paragraph>
            For more information on how Google handles data, see the <ExternalLink href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</ExternalLink>.
          </Paragraph>
        </SubSection>
      </Section>

      <Section>
        <SectionTitle>
          <Target size={24} />
          3. How We Use Collected Information
        </SectionTitle>
        <Paragraph>
          We use the information collected to:
        </Paragraph>
        <List>
          <ListItem>Improve site functionality and user experience</ListItem>
          <ListItem>Understand which pages are most useful to our visitors</ListItem>
          <ListItem>Display non-intrusive ads that help support site maintenance</ListItem>
          <ListItem>Detect and prevent technical issues or misuse</ListItem>
        </List>
        <InfoBox>
          We do not sell or rent user data to any third parties.
        </InfoBox>
      </Section>

      <Section>
        <SectionTitle>
          <Globe size={24} />
          4. Third-Party Services
        </SectionTitle>
        <Paragraph>
          micropinouts.com may link to or embed content from external services such as:
        </Paragraph>
        <List>
          <ListItem>YouTube or Vimeo (for educational videos)</ListItem>
          <ListItem>GitHub (for source code or diagrams)</ListItem>
          <ListItem>Analytics platforms (e.g., Google Analytics)</ListItem>
        </List>
        <Paragraph>
          These third-party sites have their own privacy policies. We recommend reviewing their policies before interacting with embedded content.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Users size={24} />
          5. Children's Privacy
        </SectionTitle>
        <WarningBox>
          micropinouts.com does not knowingly collect or store personal information from children under 13 years of age.
          If you believe a child has provided us with personal information, please contact legal@micropinouts.com and we will promptly delete it.
        </WarningBox>
      </Section>

      <Section>
        <SectionTitle>
          <Shield size={24} />
          6. Your Privacy Choices
        </SectionTitle>
        <Paragraph>
          You have the right to:
        </Paragraph>
        <List>
          <ListItem>Disable or delete cookies through your browser</ListItem>
          <ListItem>Opt out of personalized ads via Google Ads Settings</ListItem>
          <ListItem>Request deletion of any personally identifiable information (if applicable)</ListItem>
        </List>
        <Paragraph>
          We respect your privacy and aim to make all settings as transparent and accessible as possible.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Lock size={24} />
          7. Data Security
        </SectionTitle>
        <Paragraph>
          We take reasonable technical and organizational measures to protect collected information from unauthorized access, alteration, or disclosure.
        </Paragraph>
        <WarningBox>
          However, please note that no online platform can guarantee 100% security.
        </WarningBox>
      </Section>

      <Section>
        <SectionTitle>
          <AlertTriangle size={24} />
          8. Updates to This Policy
        </SectionTitle>
        <Paragraph>
          This Privacy Policy may be updated from time to time to reflect changes in technology, regulations, or our own practices.
          Any updates will be published on this page with a revised "Last updated" date.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Mail size={24} />
          9. Contact Us
        </SectionTitle>
        <Paragraph>
          For privacy inquiries or data removal requests, contact us at:
        </Paragraph>
        <ContactInfo>
          <Mail size={20} />
          <strong>📧 legal@micropinouts.com</strong>
        </ContactInfo>
      </Section>

      <Copyright>
        <strong>© 2025 micropinouts.com</strong><br />
        All rights reserved.<br />
        Educational electronics resources with respect for your privacy.
      </Copyright>
    </PrivacyContainer>
  );
};

export default Privacy;



