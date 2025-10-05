import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Cpu, Zap, Wifi, Thermometer } from 'lucide-react';
import { boardsAPI } from '../services/api';

const HomeContainer = styled.div`
  padding: 40px 0;
`;

const SearchSection = styled.div`
  max-width: 800px;
  margin: 0 auto 60px;
  text-align: center;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e2e8f0'};
  border-radius: 20px;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
  }
`;

const ResultsCount = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-top: 16px;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 80px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-top: 60px;
`;

const BoardCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CardBadge = styled.span`
  background: #3b82f6;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const CardDescription = styled.p`
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const CardFeatures = styled.ul`
  list-style: none;
  margin-bottom: 24px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  margin-bottom: 8px;
  font-size: 14px;
  
  &::before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
  }
`;

const CardFooter = styled.div`
  margin-top: auto;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 18px;
  margin: 40px 0;
`;

const FeaturesSection = styled.section`
  margin-top: 100px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 60px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  color: #64748b;
  line-height: 1.6;
`;

const Home = () => {
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await boardsAPI.getAll();
        setBoards(response.data);
        setFilteredBoards(response.data);
      } catch (err) {
        setError('Failed to load boards');
        console.error('Error fetching boards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Filter boards based on search term and active filter
  useEffect(() => {
    let filtered = boards;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(board =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(board => {
        switch (activeFilter) {
          case 'microcontroller':
            return board.name.toLowerCase().includes('arduino') ||
                   board.name.toLowerCase().includes('esp32') ||
                   board.name.toLowerCase().includes('feather') ||
                   board.name.toLowerCase().includes('pico');
          case 'sensor':
            return board.name.toLowerCase().includes('sensor') ||
                   board.description?.toLowerCase().includes('sensor');
          case 'adafruit':
            return board.manufacturer?.toLowerCase().includes('adafruit');
          case 'espressif':
            return board.manufacturer?.toLowerCase().includes('espressif') ||
                   board.name.toLowerCase().includes('esp');
          default:
            return true;
        }
      });
    }

    setFilteredBoards(filtered);
  }, [boards, searchTerm, activeFilter]);

  const getBoardIcon = (boardName) => {
    if (boardName.toLowerCase().includes('arduino')) return <Cpu size={24} />;
    if (boardName.toLowerCase().includes('esp')) return <Wifi size={24} />;
    if (boardName.toLowerCase().includes('raspberry')) return <Zap size={24} />;
    return <Thermometer size={24} />;
  };

  if (loading) {
    return (
      <HomeContainer>
        <div className="container">
          <LoadingSpinner>
            <div className="loading-spinner"></div>
          </LoadingSpinner>
        </div>
      </HomeContainer>
    );
  }

  if (error) {
    return (
      <HomeContainer>
        <div className="container">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <div className="container">
        <HeroSection>
          <HeroTitle>Interactive Microcontroller Pinout Database</HeroTitle>
          <HeroSubtitle>
            Explore detailed pinout diagrams for popular microcontrollers and sensor boards. 
            Click on pins to view detailed information and filter by pin groups.
          </HeroSubtitle>
        </HeroSection>

        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search boards by name, description, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <FilterSection>
            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              All Boards
            </FilterButton>
            <FilterButton
              active={activeFilter === 'microcontroller'}
              onClick={() => setActiveFilter('microcontroller')}
            >
              Microcontrollers
            </FilterButton>
            <FilterButton
              active={activeFilter === 'sensor'}
              onClick={() => setActiveFilter('sensor')}
            >
              Sensors
            </FilterButton>
            <FilterButton
              active={activeFilter === 'adafruit'}
              onClick={() => setActiveFilter('adafruit')}
            >
              Adafruit
            </FilterButton>
            <FilterButton
              active={activeFilter === 'espressif'}
              onClick={() => setActiveFilter('espressif')}
            >
              Espressif
            </FilterButton>
          </FilterSection>
          
          <ResultsCount>
            Showing {filteredBoards.length} of {boards.length} boards
          </ResultsCount>
        </SearchSection>

        {filteredBoards.length > 0 ? (
          <BoardsGrid>
            {filteredBoards.map((board, index) => (
              <BoardCard
                key={board.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardHeader>
                  <CardTitle>
                    {getBoardIcon(board.name)}
                    {board.name}
                  </CardTitle>
                  <CardBadge>{board.package_type}</CardBadge>
                </CardHeader>
                
                {board.description && (
                  <CardDescription>
                    {board.description.length > 150 
                      ? `${board.description.substring(0, 150)}...` 
                      : board.description
                    }
                  </CardDescription>
                )}
                
                <CardFeatures>
                  <FeatureItem>{board.pin_count} pins</FeatureItem>
                  <FeatureItem>{board.voltage_range} operating voltage</FeatureItem>
                  <FeatureItem>{board.clock_speed} clock speed</FeatureItem>
                  <FeatureItem>{board.flash_memory} flash memory</FeatureItem>
                  <FeatureItem>{board.ram} RAM</FeatureItem>
                </CardFeatures>
                
                <CardFooter>
                  <Link to={`/board/${board.id}`} className="btn btn-primary">
                    View Pinout
                  </Link>
                </CardFooter>
              </BoardCard>
            ))}
          </BoardsGrid>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: '#64748b', marginBottom: '16px' }}>No boards found</h3>
            <p style={{ color: '#94a3b8' }}>
              Try adjusting your search term or filter to find what you're looking for.
            </p>
          </div>
        )}

        <FeaturesSection>
          <SectionTitle>Features</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureTitle>Interactive Pinouts</FeatureTitle>
              <FeatureDescription>
                Click on any pin to view detailed information including functions, 
                voltage ranges, and alternate uses.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🔍</FeatureIcon>
              <FeatureTitle>Pin Filtering</FeatureTitle>
              <FeatureDescription>
                Filter pins by groups like power, communication, analog, 
                and PWM to focus on what you need.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureTitle>Responsive Design</FeatureTitle>
              <FeatureDescription>
                Works perfectly on desktop, tablet, and mobile devices 
                with touch-friendly interactions.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Fast & Modern</FeatureTitle>
              <FeatureDescription>
                Built with modern web technologies for fast loading 
                and smooth user experience.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
      </div>
    </HomeContainer>
  );
};

export default Home;

