import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { boardsAPI } from '../services/api';
import SVGThumbnail from '../components/SVGThumbnail';

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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const SpinnerRing = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  animation: pulse 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 3px solid #3b82f6;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const LoadingContent = styled.div`
  text-align: center;
  color: #4a5568;
`;

const LoadingTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: #64748b;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  
  span {
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-top: 60px;
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const SkeletonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SkeletonTitle = styled.div`
  height: 24px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 60%;
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const SkeletonBadge = styled.div`
  height: 20px;
  width: 80px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20px;
`;

const SkeletonDescription = styled.div`
  height: 16px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  
  &:nth-child(2) { width: 80%; }
  &:nth-child(3) { width: 60%; }
`;

const SkeletonFeatures = styled.div`
  margin: 24px 0;
`;

const SkeletonFeature = styled.div`
  height: 14px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 70%;
`;

const SkeletonButton = styled.div`
  height: 40px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  width: 120px;
  margin-top: 24px;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 60px;
  padding: 20px 0;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  
  &:hover {
    background: ${props => props.$active ? '#3b82f6' : '#f1f5f9'};
    border-color: #3b82f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #64748b;
  margin: 0 16px;
`;

const Home = () => {
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBoards, setTotalBoards] = useState(0);
  const [pageSize] = useState(12); // Fixed page size for consistency
  
  // Cache state
  const [boardsCache, setBoardsCache] = useState(new Map());
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Debounced search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchBoards = async () => {
    // Check cache first (cache for 60 seconds)
    const now = Date.now();
    if (boardsCache.has('all-boards') && (now - lastFetchTime) < 60000) {
      const cachedData = boardsCache.get('all-boards');
      setBoards(cachedData);
      setTotalBoards(cachedData.length);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load all boards at once for fast client-side filtering
      const response = await fetch('/api/boards');
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both array and paginated response formats
        const boardsData = Array.isArray(data) ? data : (data.pinouts || []);
        
        setBoards(boardsData);
        setTotalBoards(boardsData.length);
        
        // Cache the result
        setBoardsCache(prev => new Map(prev).set('all-boards', boardsData));
        setLastFetchTime(now);
        setError(null);
      } else {
        setError('Failed to load boards');
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setError('Failed to load boards. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBoards();
  }, []);

  // Client-side filtering with pagination
  useEffect(() => {
    let filtered = boards;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(board =>
        board.chip_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(board => {
        switch (activeFilter) {
          case 'microcontroller':
            return board.chip_name?.toLowerCase().includes('arduino') ||
                   board.chip_name?.toLowerCase().includes('esp32') ||
                   board.chip_name?.toLowerCase().includes('feather') ||
                   board.chip_name?.toLowerCase().includes('pico');
          case 'sensor':
            return board.chip_name?.toLowerCase().includes('sensor') ||
                   board.description?.toLowerCase().includes('sensor');
          case 'adafruit':
            return board.chip_name?.toLowerCase().includes('adafruit');
          case 'espressif':
            return board.chip_name?.toLowerCase().includes('espressif') ||
                   board.chip_name?.toLowerCase().includes('esp');
          default:
            return true;
        }
      });
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBoards = filtered.slice(startIndex, endIndex);

    setFilteredBoards(paginatedBoards);
    setTotalPages(totalPages);
    setTotalBoards(totalFiltered);
  }, [boards, searchTerm, activeFilter, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);


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
            {totalBoards} boards total
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
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
                    <SVGThumbnail 
                      svgContent={board.svg_content} 
                      boardName={board.name}
                    />
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
                  <Link to={`/board/${board.slug || board.id}`} className="btn btn-primary">
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
              {searchTerm || activeFilter !== 'all'
                ? 'Try adjusting your search term or filter to find what you\'re looking for.'
                : 'No boards are available at the moment.'
              }
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </PaginationButton>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationButton
                  key={pageNum}
                  $active={currentPage === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationButton>
              );
            })}
            
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </PaginationButton>
            
            <PaginationInfo>
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalBoards)} of {totalBoards}
            </PaginationInfo>
          </PaginationContainer>
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

