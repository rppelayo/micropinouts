import React from 'react';
import styled from 'styled-components';
import { FileText, Calendar, Shield, Users, AlertTriangle, Mail } from 'lucide-react';

const LegalContainer = styled.div`
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

const ExampleBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-style: italic;
  color: #64748b;
`;

const ContactInfo = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #92400e;
`;

const Disclaimer = styled.div`
  background: #f3f4f6;
  border-left: 4px solid #6b7280;
  padding: 16px;
  margin: 24px 0;
  border-radius: 0 8px 8px 0;
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.9rem;
`;

const Legal = () => {
  return (
    <LegalContainer>
      <Title>
        <FileText size={32} />
        Legality & Licensing
      </Title>
      
      <LastUpdated>
        <Calendar size={16} />
        Last updated: October 2025
      </LastUpdated>

      <Section>
        <SectionTitle>
          <Shield size={24} />
          1. Overview
        </SectionTitle>
        <Paragraph>
          micropinouts.com is an educational web application dedicated to providing interactive pinout diagrams and related resources for microcontrollers, sensors, and development boards.
        </Paragraph>
        <Paragraph>
          Some visual assets and diagrams featured on this site are based on publicly available Fritzing (.fzp, .fzpz, .svg) files that are openly shared in community repositories, including the official Fritzing Parts Repository and other public GitHub projects.
        </Paragraph>
        <Paragraph>
          The purpose of these resources is educational and non-commercial in nature, helping students, hobbyists, and engineers better understand electronics design and hardware connections.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Users size={24} />
          2. Use of Public Fritzing Files
        </SectionTitle>
        <Paragraph>
          micropinouts.com uses selected Fritzing parts and diagrams that meet all of the following conditions:
        </Paragraph>
        <List>
          <ListItem>They are publicly available in open repositories or forums.</ListItem>
          <ListItem>They are distributed under open or permissive licenses such as Creative Commons (CC-BY, CC-BY-SA) or similar open-source terms.</ListItem>
          <ListItem>They are used in good faith for educational and illustrative purposes only.</ListItem>
          <ListItem>Where identifiable, original authors or repositories are credited.</ListItem>
        </List>
        
        <ExampleBox>
          <strong>Example attribution:</strong><br />
          "ESP32-WROOM-32 module © Fritzing community, licensed under CC-BY-SA."
        </ExampleBox>
        
        <Paragraph>
          If a file lacks clear licensing information, we make every reasonable effort to confirm that it was publicly released and free to use for non-commercial purposes.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <FileText size={24} />
          3. Attribution and Source
        </SectionTitle>
        <Paragraph>
          Attribution is provided within each diagram, part listing, or project description when the original creator or repository is known.
        </Paragraph>
        <Paragraph>
          When attribution data is unavailable, micropinouts.com references the source repository or Fritzing part ID.
        </Paragraph>
        <Paragraph>
          We respect the rights of content creators and aim to maintain transparency and compliance with Fritzing's community guidelines.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <Shield size={24} />
          4. Educational Intent and Advertisement Disclosure
        </SectionTitle>
        <Paragraph>
          micropinouts.com is primarily an educational platform, but the site may display advertisements to support hosting and maintenance costs.
        </Paragraph>
        <Paragraph>
          These advertisements:
        </Paragraph>
        <List>
          <ListItem>Do not alter or modify any Fritzing content.</ListItem>
          <ListItem>Are served through standard ad networks (e.g., Google AdSense).</ListItem>
          <ListItem>Do not imply endorsement or sponsorship by Fritzing GmbH or by original creators of the parts or diagrams.</ListItem>
          <ListItem>All ads are clearly separated from educational content and do not affect access to the site's resources.</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>
          <Users size={24} />
          5. User-Uploaded or Linked Files
        </SectionTitle>
        <Paragraph>
          If users upload, link, or submit their own diagrams or Fritzing files, they are responsible for ensuring that:
        </Paragraph>
        <List>
          <ListItem>They have the legal right to share those files publicly.</ListItem>
          <ListItem>The content does not infringe on any intellectual property rights.</ListItem>
        </List>
        <Paragraph>
          micropinouts.com reserves the right to remove any content upon receiving a valid claim of copyright infringement.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <AlertTriangle size={24} />
          6. Copyright Concerns and Takedown Requests
        </SectionTitle>
        <Paragraph>
          If you believe your Fritzing part, diagram, or artwork has been used improperly or without attribution, please contact us and include:
        </Paragraph>
        <List>
          <ListItem>The URL of the page in question</ListItem>
          <ListItem>Proof of authorship or ownership</ListItem>
          <ListItem>The requested action (attribution or removal)</ListItem>
        </List>
        
        <ContactInfo>
          <Mail size={20} />
          <strong>Contact us at: legal@micropinouts.com</strong>
        </ContactInfo>
        
        <Paragraph>
          We review and address all legitimate requests promptly and respectfully.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>
          <AlertTriangle size={24} />
          7. Disclaimer
        </SectionTitle>
        <Disclaimer>
          <Paragraph>
            All trademarks, brand names, and product identifiers (e.g., "Arduino," "ESP32," "Raspberry Pi") are the property of their respective owners.
          </Paragraph>
          <Paragraph>
            micropinouts.com is not affiliated with or endorsed by Fritzing GmbH or any hardware manufacturer mentioned on this site.
          </Paragraph>
          <Paragraph>
            All diagrams and visualizations are provided "as is" without warranty. Users should verify all connections and pin configurations before applying them in practical projects.
          </Paragraph>
        </Disclaimer>
      </Section>

      <Copyright>
        <strong>© 2025 micropinouts.com</strong><br />
        All rights reserved.<br />
        Educational use and community sharing encouraged under applicable open-source licenses.
      </Copyright>
    </LegalContainer>
  );
};

export default Legal;
