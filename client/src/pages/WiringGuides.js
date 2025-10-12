import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const WiringGuidesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  color: #1f2937;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const WiringGuideCard = styled(Link)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #3b82f6;
  }
`;

const CardTitle = styled.h3`
  color: #1f2937;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  font-weight: bold;
`;

const CardSubtitle = styled.p`
  color: #6b7280;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
`;

const CardDescription = styled.p`
  color: #374151;
  margin: 0 0 15px 0;
  line-height: 1.5;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #9ca3af;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

const WiringGuides = () => {
  const [wiringGuides, setWiringGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWiringGuides();
  }, []);

  const fetchWiringGuides = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/micropinouts/api-php/wiring-guides');
      
      if (response.ok) {
        const data = await response.json();
        setWiringGuides(data);
        setError(null);
      } else {
        setError('Failed to load wiring guides');
      }
    } catch (err) {
      console.error('Error fetching wiring guides:', err);
      setError('Failed to load wiring guides');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <WiringGuidesContainer>
        <LoadingContainer>Loading wiring guides...</LoadingContainer>
      </WiringGuidesContainer>
    );
  }

  if (error) {
    return (
      <WiringGuidesContainer>
        <ErrorContainer>{error}</ErrorContainer>
      </WiringGuidesContainer>
    );
  }

  return (
    <WiringGuidesContainer>
      <Header>
        <Title>Wiring Guides</Title>
        <Subtitle>Step-by-step wiring instructions for connecting sensors to microcontrollers</Subtitle>
      </Header>

      {wiringGuides.length === 0 ? (
        <EmptyState>
          <h3>No wiring guides available</h3>
          <p>Check back later for new wiring guides.</p>
        </EmptyState>
      ) : (
        <Grid>
          {wiringGuides.map((guide) => (
            <WiringGuideCard key={guide.id} to={`/wiring-guide/${guide.slug}`}>
              <CardTitle>{guide.sensor_name} → {guide.microcontroller_name}</CardTitle>
              <CardSubtitle>Wiring Guide</CardSubtitle>
              {guide.description && (
                <CardDescription>{guide.description}</CardDescription>
              )}
              <CardMeta>
                <span>Created {formatDate(guide.created_at)}</span>
                <span>View Guide →</span>
              </CardMeta>
            </WiringGuideCard>
          ))}
        </Grid>
      )}
    </WiringGuidesContainer>
  );
};

export default WiringGuides;
