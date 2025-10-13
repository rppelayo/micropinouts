import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Info, Zap, Wifi, Cpu, Edit3, GitCompare } from 'lucide-react';
import { boardsAPI, pinGroupsAPI } from '../services/api';
import SVGViewer from '../components/SVGViewer';
import CompareModal from '../components/CompareModal';
import { useAuth } from '../contexts/AuthContext';

const BoardDetailContainer = styled.div`
  padding: 40px 0;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #3b82f6;
    background-color: #f1f5f9;
  }
`;

const BoardHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const EditButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  min-width: 140px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    color: white;
  }
`;

const CompareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #10b981;
  color: white;
  border: none;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #059669;
    color: white;
  }
`;

const BoardTitle = styled.h1`
  font-size: 42px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const BoardSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 24px;
`;

const BoardSpecs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const SpecItem = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const SpecLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const SpecValue = styled.div`
  font-size: 16px;
  color: #1e293b;
  font-weight: 600;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$hasSidebar ? '1fr 400px' : '1fr'};
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const PinoutSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const PinoutTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PinoutDiagram = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  min-height: 400px;
  padding: 20px;
  margin-bottom: 24px;
  overflow: hidden;
`;


const Pin = styled(motion.div)`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &.selected {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  }
`;

const PinLabel = styled.div`
  position: absolute;
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  
  &.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 4px;
  }
  
  &.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 4px;
  }
  
  &.left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 4px;
  }
  
  &.right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 4px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
`;

const FilterTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? props.$color : '#e2e8f0'};
  background: ${props => props.$active ? props.$color : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$color : props.$color + '20'};
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoPanel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const PanelTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PinInfo = styled.div`
  text-align: center;
  color: #64748b;
  font-style: italic;
`;

const PinDetails = styled.div`
  .pin-name {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }
  
  .pin-number {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 16px;
  }
  
  .pin-functions {
    background: #f1f5f9;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #475569;
  }
  
  .pin-specs {
    display: grid;
    gap: 8px;
  }
  
  .spec-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  
  .spec-label {
    color: #64748b;
  }
  
  .spec-value {
    color: #1e293b;
    font-weight: 500;
  }
  
  .pin-description {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 14px;
    color: #475569;
    border-left: 3px solid #3b82f6;
    text-align: justify;
  }
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



const BoardDetail = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [pinGroups, setPinGroups] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const { isAuthenticated } = useAuth();

  // Handle clicks on SVG pins
  const handleSVGPinClick = (event) => {
    const target = event.target;
    
    // Check if clicked element is a pin hole
    if (target.classList && target.classList.contains('pin-hole')) {
      const pinName = target.getAttribute('data-pin');
      
      if (pinName) {
        // Find the pin in our pins array by name
        const pin = pins.find(p => p.pin_name === pinName);
        
        if (pin) {
          setSelectedPin(pin);
          
          // Remove previous selection
          document.querySelectorAll('.pin-hole.selected').forEach(el => {
            el.classList.remove('selected');
          });
          
          // Add selection to clicked pin
          target.classList.add('selected');
        }
      }
    }
  };

  // Function to filter SVG elements based on active group filters
  const filterSVGElements = () => {
    if (!board?.svg_content) return;
    
    // Get all pin-hole elements
    const pinElements = document.querySelectorAll('.pin-hole');
    
    pinElements.forEach(element => {
      const pinName = element.getAttribute('data-pin');
      const pin = pins.find(p => p.pin_name === pinName);
      
      if (pin) {
        // Check if this pin's group is in active filters
        const isGroupActive = activeFilters.length === 0 || activeFilters.includes(pin.pin_group_id);
        
        if (isGroupActive) {
          element.classList.remove('hidden');
        } else {
          element.classList.add('hidden');
        }
      }
    });
  };


  // Update SVG filtering when activeFilters change
  useEffect(() => {
    filterSVGElements();
  }, [activeFilters, pins, board]);


  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [boardResponse, pinsResponse, groupsResponse] = await Promise.all([
        boardsAPI.getById(id),
        boardsAPI.getPins(id),
        pinGroupsAPI.getAll()
      ]);
      
      setBoard(boardResponse.data);
      setPins(pinsResponse.data);
      setPinGroups(groupsResponse.data);
    } catch (err) {
      setError('Failed to load board data');
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);


  // Refetch data when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    const handleFocus = () => {
      fetchData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  const toggleFilter = (groupId) => {
    setActiveFilters(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredPins = activeFilters.length === 0 
    ? pins 
    : pins.filter(pin => activeFilters.includes(pin.pin_group_id));

  const getBoardIcon = (boardName) => {
    if (boardName?.toLowerCase().includes('arduino')) return <Cpu size={32} />;
    if (boardName?.toLowerCase().includes('esp')) return <Wifi size={32} />;
    return <Zap size={32} />;
  };

  if (loading) {
    return (
      <BoardDetailContainer>
        <div className="container">
          <LoadingSpinner>
            <div className="loading-spinner"></div>
          </LoadingSpinner>
        </div>
      </BoardDetailContainer>
    );
  }

  if (error || !board) {
    return (
      <BoardDetailContainer>
        <div className="container">
          <ErrorMessage>{error || 'Board not found'}</ErrorMessage>
        </div>
      </BoardDetailContainer>
    );
  }

  return (
    <BoardDetailContainer>
      <div className="container">
        <BackButton to="/">
          <ArrowLeft size={20} />
          Back to Boards
        </BackButton>

        <BoardHeader>
          <BoardTitle>
            {getBoardIcon(board.name)}
            {board.name}
          </BoardTitle>
          <BoardSubtitle>{board.description}</BoardSubtitle>
          
          <BoardSpecs>
            <SpecItem>
              <SpecLabel>Package</SpecLabel>
              <SpecValue>{board.package_type}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>Pins</SpecLabel>
              <SpecValue>{board.pin_count}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>Voltage</SpecLabel>
              <SpecValue>{board.voltage_range}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>Clock Speed</SpecLabel>
              <SpecValue>{board.clock_speed}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>Flash</SpecLabel>
              <SpecValue>{board.flash_memory}</SpecValue>
            </SpecItem>
            <SpecItem>
              <SpecLabel>RAM</SpecLabel>
              <SpecValue>{board.ram}</SpecValue>
            </SpecItem>
            {board.link && (
              <SpecItem style={{ gridColumn: '1 / -1' }}>
                <SpecLabel>Documentation</SpecLabel>
                <SpecValue>
                  <a 
                    href={board.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#3b82f6', 
                      textDecoration: 'underline',
                      wordBreak: 'break-all'
                    }}
                  >
                    {board.link}
                  </a>
                </SpecValue>
              </SpecItem>
            )}
          </BoardSpecs>
        </BoardHeader>

          <ContentGrid $hasSidebar={true}>
            <PinoutSection>
              <PinoutTitle>
                <Info size={24} />
                Interactive Pinout Diagram
              </PinoutTitle>
              
              <FilterSection>
                <FilterTitle>
                  <Filter size={20} />
                  Filter by Pin Group
                </FilterTitle>
                <FilterButtons>
                  {pinGroups.map(group => (
                    <FilterButton
                      key={group.id}
                      $active={activeFilters.includes(group.id)}
                      $color={group.color}
                      onClick={() => toggleFilter(group.id)}
                    >
                      {group.name}
                    </FilterButton>
                  ))}
                </FilterButtons>
              </FilterSection>

              <PinoutDiagram>
                <SVGViewer
                  svgContent={board?.svg_content}
                  onPinClick={handleSVGPinClick}
                  initialZoom={1}
                  minZoom={0.2}
                  maxZoom={3}
                  enablePan={true}
                  enableZoom={true}
                />
              </PinoutDiagram>
            </PinoutSection>

            <Sidebar>
              <ButtonContainer>
                <CompareButton onClick={() => setShowCompareModal(true)}>
                  <GitCompare size={16} />
                  Compare
                </CompareButton>
                {isAdmin && (
                  <EditButton to={`/admin/boards/${id}/edit`}>
                    <Edit3 size={16} />
                    Edit Board
                  </EditButton>
                )}
              </ButtonContainer>
              
              <InfoPanel>
                <PanelTitle>
                  <Info size={20} />
                  Pin Information
                </PanelTitle>
                
                <AnimatePresence mode="wait">
                  {selectedPin ? (
                    <motion.div
                      key={selectedPin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PinDetails>
                        <div className="pin-name">{selectedPin.pin_name}</div>
                        <div className="pin-number">Pin {selectedPin.pin_number}</div>
                        
                        {selectedPin.functions && (
                          <div className="pin-functions">
                            <strong>Primary Function:</strong><br />
                            {selectedPin.functions}
                          </div>
                        )}
                        
                        {selectedPin.alternate_functions && (
                          <div className="pin-functions">
                            <strong>Alternate Functions:</strong><br />
                            {selectedPin.alternate_functions}
                          </div>
                        )}
                        
                        <div className="pin-specs">
                          {selectedPin.voltage_range && (
                            <div className="spec-row">
                              <span className="spec-label">Voltage Range:</span>
                              <span className="spec-value">{selectedPin.voltage_range}</span>
                            </div>
                          )}
                          {selectedPin.current_limit && (
                            <div className="spec-row">
                              <span className="spec-label">Current Limit:</span>
                              <span className="spec-value">{selectedPin.current_limit}</span>
                            </div>
                          )}
                          {selectedPin.group_name && (
                            <div className="spec-row">
                              <span className="spec-label">Category:</span>
                              <span className="spec-value">{selectedPin.group_name}</span>
                            </div>
                          )}
                        </div>
                        
                        {selectedPin.description && (
                          <div className="pin-description">
                            <strong>Description:</strong><br />
                            {selectedPin.description}
                          </div>
                        )}
                      </PinDetails>
                    </motion.div>
                  ) : (
                    <PinInfo>
                      Click on a pin to view detailed information
                    </PinInfo>
                  )}
                </AnimatePresence>
              </InfoPanel>
            </Sidebar>
          </ContentGrid>
      </div>
      

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        currentBoard={board}
      />
    </BoardDetailContainer>
  );
};

export default BoardDetail;
