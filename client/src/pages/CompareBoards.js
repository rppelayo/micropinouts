import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, ExternalLink, Info, Zap, Cpu, Memory, Clock, Package, Link as LinkIcon, Check, GitCompare } from 'lucide-react';
import SVGViewer from '../components/SVGViewer';
import { boardsAPI } from '../services/api';

const CompareContainer = styled.div`
  padding: 40px 0;
  max-width: 1400px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  background: none;
  border: none;
  font-weight: 500;
  margin-bottom: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
    background-color: #f1f5f9;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const AddBoardSection = styled.div`
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  margin-bottom: 32px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background-color: #f8fafc;
  }
`;

const AddBoardButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const BoardCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  position: relative;
`;

const BoardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const BoardTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  padding-right: 40px;
`;

const BoardSubtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
`;

const BoardSpecs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SpecLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SpecValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const BoardContent = styled.div`
  padding: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SVGContainer = styled.div`
  height: 500px;
  min-height: 400px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  
  @media (max-width: 768px) {
    height: 400px;
    min-height: 300px;
  }
`;

const LinkContainer = styled.div`
  margin-top: 16px;
`;

const DocumentationLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    border-color: #3b82f6;
  }
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 40px;
  text-align: center;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
`;

const BoardSelectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const SelectionHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const SelectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
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

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
`;

const BoardSelectionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f9ff' : 'white'};
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const BoardSelectionInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const BoardSelectionName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const BoardSelectionDetails = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const SelectionCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? '#3b82f6' : '#e2e8f0'};
  border-radius: 4px;
  background: ${props => props.checked ? '#3b82f6' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  svg {
    color: white;
    width: 12px;
    height: 12px;
  }
`;

const SelectionFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
`;

const SelectionCount = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const StartCompareButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const PinInfoOverlay = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const PinInfoHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
`;

const PinInfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const PinInfoSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const PinInfoContent = styled.div`
  padding: 20px 24px;
`;

const PinInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PinInfoLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
`;

const PinInfoValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  text-align: right;
  max-width: 200px;
  word-wrap: break-word;
`;

const PinInfoCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const CompareBoards = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [allBoards, setAllBoards] = useState([]);
  const [boardPins, setBoardPins] = useState({}); // Store pins for each board
  const [selectedPin, setSelectedPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBoardSelection, setShowBoardSelection] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Get board IDs from URL parameters (memoized to prevent infinite loops)
  const boardIds = useMemo(() => {
    return searchParams.get('boards')?.split(',').filter(Boolean) || [];
  }, [searchParams]);

  useEffect(() => {
    if (boardIds.length === 0) {
      setLoading(false);
      setShowBoardSelection(true);
      return;
    }

    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await boardsAPI.compare(boardIds.join(','));
        
        if (response.data && Array.isArray(response.data)) {
          setBoards(response.data);
          
          // Fetch pins for each board
          const pinsPromises = response.data.map(async (board) => {
            try {
              const pinsResponse = await boardsAPI.getPins(board.id);
              return { boardId: board.id, pins: pinsResponse.data };
            } catch (err) {
              console.error(`Error fetching pins for board ${board.id}:`, err);
              return { boardId: board.id, pins: [] };
            }
          });
          
          const pinsResults = await Promise.all(pinsPromises);
          const pinsMap = {};
          pinsResults.forEach(({ boardId, pins }) => {
            pinsMap[boardId] = pins;
          });
          setBoardPins(pinsMap);
        } else {
          setError('Invalid response from server');
        }
      } catch (err) {
        console.error('Error fetching boards for comparison:', err);
        setError(`Failed to load boards for comparison: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [boardIds]);

  // Fetch all boards for selection
  useEffect(() => {
    if (showBoardSelection) {
      const fetchAllBoards = async () => {
        try {
          const response = await boardsAPI.getAll();
          setAllBoards(response.data);
        } catch (err) {
          console.error('Error fetching all boards:', err);
        }
      };
      fetchAllBoards();
    }
  }, [showBoardSelection]);

  const addMoreBoards = () => {
    // Pre-populate selectedBoards with currently compared board IDs
    const currentBoardIds = new Set(boards.map(board => board.id.toString()));
    setSelectedBoards(currentBoardIds);
    setShowBoardSelection(true);
  };

  const toggleBoardSelection = (boardId) => {
    const boardIdStr = boardId.toString();
    const newSelection = new Set(selectedBoards);
    
    if (newSelection.has(boardIdStr)) {
      newSelection.delete(boardIdStr);
    } else if (newSelection.size < 2) { // Limit to 2 boards
      newSelection.add(boardIdStr);
    }
    setSelectedBoards(newSelection);
  };

  const handleStartComparison = () => {
    if (selectedBoards.size >= 2) {
      const boardIds = Array.from(selectedBoards).join(',');
      navigate(`/compare?boards=${boardIds}`);
    }
  };

  const removeBoard = (boardIdToRemove) => {
    const remainingBoards = boards.filter(board => board.id !== boardIdToRemove);
    if (remainingBoards.length === 0) {
      // If no boards left, go back to home
      navigate('/');
    } else {
      // Update URL with remaining boards
      const remainingIds = remainingBoards.map(board => board.id).join(',');
      navigate(`/compare?boards=${remainingIds}`);
    }
  };

  const filteredBoards = allBoards.filter(board => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // When adding more boards, exclude boards that are already being compared
    const isAlreadyCompared = boards.some(comparedBoard => comparedBoard.id === board.id);
    
    return matchesSearch && !isAlreadyCompared;
  });

  // Handle pin clicks
  const handlePinClick = (event, boardId) => {
    console.log('🔍 Compare SVG Click Debug:');
    console.log('- Event target:', event.target);
    console.log('- Target tagName:', event.target.tagName);
    console.log('- Target classes:', event.target.classList);
    console.log('- Target data-pin:', event.target.getAttribute('data-pin'));
    
    const target = event.target;
    
    // Check if clicked element is a pin hole
    if (target.classList && target.classList.contains('pin-hole')) {
      console.log('✅ Clicked element has pin-hole class');
      const pinName = target.getAttribute('data-pin');
      console.log('- Pin name from data-pin:', pinName);
      
      if (pinName) {
        // Find the pin in our pins array by name
        const pins = boardPins[boardId] || [];
        const pin = pins.find(p => p.pin_name === pinName);
        console.log('- Found pin in array:', pin);
        
        if (pin) {
          const boardName = boards.find(b => b.id === boardId)?.name;
          setSelectedPin({ ...pin, boardId, boardName });
          console.log('✅ Pin info set:', { ...pin, boardId, boardName });
        } else {
          console.log('❌ Pin not found in array for name:', pinName);
        }
      } else {
        console.log('❌ No data-pin attribute found');
      }
    } else {
      console.log('❌ Clicked element does not have pin-hole class');
    }
  };

  const getBoardIcon = (name) => {
    if (name.toLowerCase().includes('arduino')) return '🟠';
    if (name.toLowerCase().includes('raspberry')) return '🍓';
    if (name.toLowerCase().includes('esp')) return '📡';
    if (name.toLowerCase().includes('feather')) return '🪶';
    return '🔌';
  };

  if (loading) {
    return (
      <CompareContainer>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </BackButton>
        
        <Header>
          <Title>Compare Boards</Title>
          <Subtitle>Loading boards for comparison...</Subtitle>
        </Header>

        <ComparisonGrid>
          {boardIds.map((id, index) => (
            <LoadingCard key={id}>
              Loading board {index + 1}...
            </LoadingCard>
          ))}
        </ComparisonGrid>
      </CompareContainer>
    );
  }

  if (error) {
    return (
      <CompareContainer>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </BackButton>
        
        <Header>
          <Title>Compare Boards</Title>
          <Subtitle>Compare specifications and features</Subtitle>
        </Header>

        <ErrorMessage>{error}</ErrorMessage>
      </CompareContainer>
    );
  }

  if (boards.length === 0) {
    return (
      <CompareContainer>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </BackButton>
        
        <Header>
          <Title>Compare Boards</Title>
          <Subtitle>Compare specifications and features</Subtitle>
        </Header>

        {showBoardSelection ? (
          <BoardSelectionContainer>
            <SelectionHeader>
              <SelectionTitle>Select Boards to Compare</SelectionTitle>
              <SearchInput
                type="text"
                placeholder="Search boards by name, manufacturer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SelectionHeader>

            <BoardsGrid>
              {filteredBoards.map((board) => (
                <BoardSelectionItem
                  key={board.id}
                  selected={selectedBoards.has(board.id.toString())}
                  onClick={() => toggleBoardSelection(board.id)}
                >
                  <SelectionCheckbox checked={selectedBoards.has(board.id.toString())}>
                    {selectedBoards.has(board.id.toString()) && <Check size={12} />}
                  </SelectionCheckbox>
                  <span style={{ fontSize: '24px' }}>{getBoardIcon(board.name)}</span>
                  <BoardSelectionInfo>
                    <BoardSelectionName>{board.name}</BoardSelectionName>
                    <BoardSelectionDetails>
                      {board.manufacturer} • {board.pin_count} pins • {board.package_type}
                    </BoardSelectionDetails>
                  </BoardSelectionInfo>
                </BoardSelectionItem>
              ))}
            </BoardsGrid>

            <SelectionFooter>
              <SelectionCount>
                {selectedBoards.size === 0 
                  ? 'Select at least 2 boards to compare'
                  : `${selectedBoards.size} board${selectedBoards.size !== 1 ? 's' : ''} selected`
                }
              </SelectionCount>
              <StartCompareButton
                onClick={handleStartComparison}
                disabled={selectedBoards.size < 2}
              >
                <GitCompare size={16} />
                Start Comparison
              </StartCompareButton>
            </SelectionFooter>
          </BoardSelectionContainer>
        ) : (
          <EmptyState>
            <EmptyTitle>No boards selected for comparison</EmptyTitle>
            <EmptyDescription>
              Select boards from the home page to compare their specifications, pinouts, and features.
            </EmptyDescription>
            <AddBoardButton onClick={addMoreBoards}>
              <Plus size={20} />
              Browse Boards
            </AddBoardButton>
          </EmptyState>
        )}
      </CompareContainer>
    );
  }

  return (
    <CompareContainer>
      <BackButton onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back to Home
      </BackButton>
      
      <Header>
        <Title>Compare Boards</Title>
        <Subtitle>
          {boards.length === 1 
            ? 'Board details and specifications' 
            : `Compare ${boards.length} boards side by side`
          }
        </Subtitle>
      </Header>

      {showBoardSelection ? (
        <BoardSelectionContainer>
          <SelectionHeader>
            <SelectionTitle>Add More Boards to Comparison</SelectionTitle>
            <SearchInput
              type="text"
              placeholder="Search boards by name, manufacturer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SelectionHeader>

          <BoardsGrid>
            {filteredBoards.map((board) => (
              <BoardSelectionItem
                key={board.id}
                selected={selectedBoards.has(board.id.toString())}
                onClick={() => toggleBoardSelection(board.id)}
              >
                <SelectionCheckbox checked={selectedBoards.has(board.id.toString())}>
                  {selectedBoards.has(board.id.toString()) && <Check size={12} />}
                </SelectionCheckbox>
                <span style={{ fontSize: '24px' }}>{getBoardIcon(board.name)}</span>
                <BoardSelectionInfo>
                  <BoardSelectionName>{board.name}</BoardSelectionName>
                  <BoardSelectionDetails>
                    {board.manufacturer} • {board.pin_count} pins • {board.package_type}
                  </BoardSelectionDetails>
                </BoardSelectionInfo>
              </BoardSelectionItem>
            ))}
          </BoardsGrid>

          <SelectionFooter>
            <SelectionCount>
              {selectedBoards.size === 0 
                ? 'Select at least 2 boards to compare'
                : `${selectedBoards.size} board${selectedBoards.size !== 1 ? 's' : ''} selected`
              }
            </SelectionCount>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowBoardSelection(false)}
                style={{
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <StartCompareButton
                onClick={handleStartComparison}
                disabled={selectedBoards.size < 2}
              >
                <GitCompare size={16} />
                Start Comparison
              </StartCompareButton>
            </div>
          </SelectionFooter>
        </BoardSelectionContainer>
      ) : (
        boards.length < 2 && (
          <AddBoardSection>
            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
              Want to compare more boards?
            </h3>
            <p style={{ marginBottom: '24px', color: '#64748b' }}>
              You can compare up to 2 boards at once. Add more boards to get a comprehensive comparison.
            </p>
            <AddBoardButton onClick={addMoreBoards}>
              <Plus size={20} />
              Add More Boards
            </AddBoardButton>
          </AddBoardSection>
        )
      )}

      <ComparisonGrid>
        <AnimatePresence>
          {boards.map((board, index) => (
            <BoardCard
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <BoardHeader>
                <RemoveButton onClick={() => removeBoard(board.id)}>
                  <X size={16} />
                </RemoveButton>
                
                <BoardTitle>
                  {getBoardIcon(board.name)} {board.name}
                </BoardTitle>
                <BoardSubtitle>{board.manufacturer}</BoardSubtitle>
                
                <BoardSpecs>
                  <SpecItem>
                    <SpecLabel>Package</SpecLabel>
                    <SpecValue>{board.package_type || 'N/A'}</SpecValue>
                  </SpecItem>
                  <SpecItem>
                    <SpecLabel>Pins</SpecLabel>
                    <SpecValue>{board.pin_count || 'N/A'}</SpecValue>
                  </SpecItem>
                  <SpecItem>
                    <SpecLabel>Voltage</SpecLabel>
                    <SpecValue>{board.voltage_range || 'N/A'}</SpecValue>
                  </SpecItem>
                  <SpecItem>
                    <SpecLabel>Clock</SpecLabel>
                    <SpecValue>{board.clock_speed || 'N/A'}</SpecValue>
                  </SpecItem>
                  <SpecItem>
                    <SpecLabel>Flash</SpecLabel>
                    <SpecValue>{board.flash_memory || 'N/A'}</SpecValue>
                  </SpecItem>
                  <SpecItem>
                    <SpecLabel>RAM</SpecLabel>
                    <SpecValue>{board.ram || 'N/A'}</SpecValue>
                  </SpecItem>
                </BoardSpecs>
              </BoardHeader>

              <BoardContent>
                <SectionTitle>
                  <Info size={16} />
                  Description
                </SectionTitle>
                <div 
                  style={{ 
                    color: '#64748b', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    textAlign: 'left'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: board.description || 'No description available' 
                  }}
                />

                {board.link && (
                  <LinkContainer>
                    <DocumentationLink href={board.link} target="_blank" rel="noopener noreferrer">
                      <LinkIcon size={16} />
                      Documentation
                    </DocumentationLink>
                  </LinkContainer>
                )}

                {board.svg_content && (
                  <>
                    <SectionTitle style={{ marginTop: '24px' }}>
                      <Zap size={16} />
                      Pinout Diagram
                    </SectionTitle>
                    <SVGContainer>
                      <SVGViewer
                        svgContent={board.svg_content}
                        onPinClick={(e) => handlePinClick(e, board.id)}
                        enableZoom={true}
                        enablePan={true}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </SVGContainer>
                  </>
                )}
              </BoardContent>
            </BoardCard>
          ))}
        </AnimatePresence>
      </ComparisonGrid>

      {/* Pin Information Overlay */}
      <AnimatePresence>
        {selectedPin && (
          <PinInfoOverlay
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <PinInfoCloseButton onClick={() => setSelectedPin(null)}>
              <X size={20} />
            </PinInfoCloseButton>
            
            <PinInfoHeader>
              <PinInfoTitle>{selectedPin.pin_name || selectedPin.pin_number}</PinInfoTitle>
              <PinInfoSubtitle>{selectedPin.boardName}</PinInfoSubtitle>
            </PinInfoHeader>
            
            <PinInfoContent>
              <PinInfoRow>
                <PinInfoLabel>Pin Number</PinInfoLabel>
                <PinInfoValue>{selectedPin.pin_number}</PinInfoValue>
              </PinInfoRow>
              
              {selectedPin.pin_name && (
                <PinInfoRow>
                  <PinInfoLabel>Pin Name</PinInfoLabel>
                  <PinInfoValue>{selectedPin.pin_name}</PinInfoValue>
                </PinInfoRow>
              )}
              
              {selectedPin.functions && (
                <PinInfoRow>
                  <PinInfoLabel>Functions</PinInfoLabel>
                  <PinInfoValue>{selectedPin.functions}</PinInfoValue>
                </PinInfoRow>
              )}
              
              {selectedPin.voltage_range && (
                <PinInfoRow>
                  <PinInfoLabel>Voltage Range</PinInfoLabel>
                  <PinInfoValue>{selectedPin.voltage_range}</PinInfoValue>
                </PinInfoRow>
              )}
              
              {selectedPin.group_name && (
                <PinInfoRow>
                  <PinInfoLabel>Group</PinInfoLabel>
                  <PinInfoValue>{selectedPin.group_name}</PinInfoValue>
                </PinInfoRow>
              )}
              
              {selectedPin.description && (
                <PinInfoRow>
                  <PinInfoLabel>Description</PinInfoLabel>
                  <PinInfoValue dangerouslySetInnerHTML={{ __html: selectedPin.description }} />
                </PinInfoRow>
              )}
            </PinInfoContent>
          </PinInfoOverlay>
        )}
      </AnimatePresence>
    </CompareContainer>
  );
};

export default CompareBoards;
