import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Info, Zap, Wifi, Cpu, Edit3 } from 'lucide-react';
import { boardsAPI, pinGroupsAPI } from '../services/api';
import SVGViewer from '../components/SVGViewer';

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
  position: relative;
`;

const EditButton = styled(Link)`
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
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

const DebugToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  z-index: 1000;
  
  &:hover {
    background: #2563eb;
  }
`;

const DebugPanel = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
`;

const DebugTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
`;

const DebugSection = styled.div`
  margin-bottom: 16px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
`;

const DebugPin = styled.div`
  margin: 4px 0;
  padding: 4px;
  background: white;
  border-radius: 3px;
  border-left: 3px solid #3b82f6;
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
  const [showDebug, setShowDebug] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  // Handle clicks on SVG pins
  const handleSVGPinClick = (event) => {
    console.log('🔍 SVG Click Debug:');
    console.log('- Event target:', event.target);
    console.log('- Target tagName:', event.target.tagName);
    console.log('- Target classes:', event.target.classList);
    console.log('- Target id:', event.target.id);
    console.log('- Target data-pin:', event.target.getAttribute('data-pin'));
    console.log('- Target data-group:', event.target.getAttribute('data-group'));
    
    const target = event.target;
    
    // Check if clicked element is a pin hole
    if (target.classList && target.classList.contains('pin-hole')) {
      console.log('✅ Clicked element has pin-hole class');
      const pinName = target.getAttribute('data-pin');
      console.log('- Pin name from data-pin:', pinName);
      
      if (pinName) {
        // Find the pin in our pins array by name
        const pin = pins.find(p => p.pin_name === pinName);
        console.log('- Found pin in array:', pin);
        console.log('- Total pins in array:', pins.length);
        
        if (pin) {
          setSelectedPin(pin);
          console.log(`✅ SVG pin clicked successfully: ${pinName}`);
          
          // Remove previous selection
          document.querySelectorAll('.pin-hole.selected').forEach(el => {
            el.classList.remove('selected');
          });
          
          // Add selection to clicked pin
          target.classList.add('selected');
        } else {
          console.log('❌ Pin not found in pins array for:', pinName);
          console.log('Available pin names:', pins.map(p => p.pin_name));
        }
      } else {
        console.log('❌ No data-pin attribute found');
      }
    } else {
      console.log('❌ Clicked element does not have pin-hole class');
      console.log('- Available classes:', target.classList ? Array.from(target.classList) : 'none');
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

  // Debug effect to log data when loaded
  useEffect(() => {
    if (board && pins.length > 0 && pinGroups.length > 0) {
      console.log('🔍 Board Data Loaded Debug:');
      console.log('- Board:', board.name, 'ID:', board.id);
      console.log('- SVG content length:', board.svg_content?.length);
      console.log('- Pins count:', pins.length);
      console.log('- Pin groups count:', pinGroups.length);
      console.log('- First 3 pins:', pins.slice(0, 3));
      console.log('- Pin groups:', pinGroups);
      
      // Check SVG content
      if (board.svg_content) {
        const hasPinHole = board.svg_content.includes('pin-hole');
        const hasDataPin = board.svg_content.includes('data-pin');
        const pinHoleCount = (board.svg_content.match(/class="pin-hole[^"]*"/g) || []).length;
        const dataPinCount = (board.svg_content.match(/data-pin="[^"]*"/g) || []).length;
        
        console.log('🔍 SVG Content Analysis:');
        console.log('- Has pin-hole class:', hasPinHole);
        console.log('- Has data-pin attribute:', hasDataPin);
        console.log('- Pin-hole elements count:', pinHoleCount);
        console.log('- Data-pin elements count:', dataPinCount);
        
        if (pinHoleCount > 0) {
          const firstPinMatch = board.svg_content.match(/<circle[^>]*class="pin-hole[^"]*"[^>]*>/);
          if (firstPinMatch) {
            console.log('- First pin element:', firstPinMatch[0]);
          }
        }
      }
    }
  }, [board, pins, pinGroups]);

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
          {isAdmin && (
            <EditButton to={`/admin/boards/${id}/edit`}>
              <Edit3 size={16} />
              Edit Board
            </EditButton>
          )}
          <BoardTitle>
            {getBoardIcon(board.name)}
            {board.name}
          </BoardTitle>
          <BoardSubtitle>{board.description}</BoardSubtitle>
          <DebugToggle onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </DebugToggle>
          
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
      
      {showDebug && (
        <DebugPanel>
          <DebugTitle>Debug Information</DebugTitle>
          
          <DebugSection>
            <strong>Board Info:</strong><br/>
            ID: {board?.id}<br/>
            Name: {board?.name}<br/>
            Has SVG: {board?.svg_content ? 'Yes' : 'No'}<br/>
            SVG Length: {board?.svg_content?.length || 0} chars
          </DebugSection>
          
          <DebugSection>
            <strong>Pin Statistics:</strong><br/>
            Total Pins: {pins.length}<br/>
            Filtered Pins: {filteredPins.length}<br/>
            Active Filters: {activeFilters.length}
          </DebugSection>
          
          <DebugSection>
            <strong>Pin Positions (First 10):</strong>
            {pins.slice(0, 10).map(pin => {
              // Calculate breadboard and transformed positions (same logic as in pin rendering)
              const containerWidth = 800; // Approximate container width
              const containerHeight = 600; // Approximate container height
              const svgScale = 0.9;
              const actualSvgWidth = containerWidth * svgScale;
              const actualSvgHeight = containerHeight * svgScale;
              const offsetX = (containerWidth - actualSvgWidth) / 2;
              const offsetY = (containerHeight - actualSvgHeight) / 2;
              
              // Use direct SVG coordinates (no transformation needed)
              const svgX = pin.position_x || 0;
              const svgY = pin.position_y || 0;
              
              // Calculate transformed positions
              const scaleX = actualSvgWidth / 75.7249;
              const scaleY = actualSvgHeight / 114.353;
              const transformedX = (svgX * scaleX) + offsetX;
              const transformedY = (svgY * scaleY) + offsetY - 20; // Move labels up slightly
              
              return (
                <DebugPin key={pin.id}>
                  <strong>{pin.pin_number}</strong> ({pin.pin_name})<br/>
                  SVG Position: ({pin.position_x}, {pin.position_y})<br/>
                  SVG ID: {pin.svg_id || 'N/A'}<br/>
                  Transformed Position: ({transformedX.toFixed(1)}, {transformedY.toFixed(1)})<br/>
                  Group: {pin.group_name || 'Unknown'}<br/>
                  Functions: {pin.functions || 'None'}
                </DebugPin>
              );
            })}
          </DebugSection>
          
          <DebugSection>
            <strong>Pin Groups:</strong>
            {pinGroups.map(group => (
              <DebugPin key={group.id}>
                <strong>{group.name}</strong><br/>
                Color: {group.color}<br/>
                Count: {pins.filter(p => p.pin_group_id === group.id).length}
              </DebugPin>
            ))}
          </DebugSection>
          
          <DebugSection>
            <strong>SVG Content Analysis:</strong>
            <DebugPin>
              <strong>SVG Content:</strong><br/>
              Length: {board?.svg_content?.length || 0} characters<br/>
              Has pin-hole class: {board?.svg_content?.includes('pin-hole') ? '✅ Yes' : '❌ No'}<br/>
              Has data-pin attribute: {board?.svg_content?.includes('data-pin') ? '✅ Yes' : '❌ No'}<br/>
              Has group-digital class: {board?.svg_content?.includes('group-digital') ? '✅ Yes' : '❌ No'}<br/>
              Has data-group="Digital": {board?.svg_content?.includes('data-group="Digital"') ? '✅ Yes' : '❌ No'}<br/>
              Pin-hole elements count: {board?.svg_content?.match(/class="pin-hole[^"]*"/g)?.length || 0}<br/>
              Data-pin elements count: {board?.svg_content?.match(/data-pin="[^"]*"/g)?.length || 0}
            </DebugPin>
          </DebugSection>
          
          <DebugSection>
            <strong>Click Test:</strong>
            <DebugPin>
              Click on any pin in the SVG above and check the browser console for debug information.
              <br/><br/>
              <button 
                onClick={() => {
                  console.log('🔍 Manual Debug Check:');
                  console.log('- Board SVG content length:', board?.svg_content?.length);
                  console.log('- Pins array length:', pins.length);
                  console.log('- Pin groups length:', pinGroups.length);
                  console.log('- First 5 pins:', pins.slice(0, 5));
                  
                  // Check for pin-hole elements in DOM
                  const pinHoleElements = document.querySelectorAll('.pin-hole');
                  console.log('- Pin-hole elements in DOM:', pinHoleElements.length);
                  
                  if (pinHoleElements.length > 0) {
                    console.log('- First pin-hole element:', pinHoleElements[0]);
                    console.log('- First pin-hole classes:', pinHoleElements[0].classList);
                    console.log('- First pin-hole data-pin:', pinHoleElements[0].getAttribute('data-pin'));
                  }
                }}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Run Manual Debug Check
              </button>
            </DebugPin>
          </DebugSection>
        </DebugPanel>
      )}
    </BoardDetailContainer>
  );
};

export default BoardDetail;
