import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, GitCompare } from 'lucide-react';
import { boardsAPI } from '../services/api';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchSection = styled.div`
  padding: 24px 24px 0;
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

const BoardsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
`;

const BoardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f9ff' : 'white'};
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const BoardInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const BoardName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const BoardDetails = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const Checkbox = styled.div`
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

const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectionCount = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const CompareButton = styled.button`
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

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
`;

const CompareModal = ({ isOpen, onClose, currentBoard }) => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = boards.filter(board => 
        board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBoards(filtered);
    } else {
      setFilteredBoards(boards);
    }
  }, [boards, searchTerm]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getAll();
      // Filter out the current board from the list
      const otherBoards = response.data.filter(board => board.id !== currentBoard.id);
      setBoards(otherBoards);
    } catch (err) {
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBoardSelection = (boardId) => {
    const newSelection = new Set(selectedBoards);
    if (newSelection.has(boardId)) {
      newSelection.delete(boardId);
    } else if (newSelection.size < 3) { // Limit to 3 additional boards (4 total)
      newSelection.add(boardId);
    }
    setSelectedBoards(newSelection);
  };

  const handleCompare = () => {
    if (selectedBoards.size > 0) {
      const allBoardIds = [currentBoard.id, ...Array.from(selectedBoards)];
      navigate(`/compare?boards=${allBoardIds.join(',')}`);
      onClose();
    }
  };

  const getBoardIcon = (name) => {
    if (name.toLowerCase().includes('arduino')) return '🟠';
    if (name.toLowerCase().includes('raspberry')) return '🍓';
    if (name.toLowerCase().includes('esp')) return '📡';
    if (name.toLowerCase().includes('feather')) return '🪶';
    return '🔌';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>Compare with Other Boards</ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={24} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <SearchSection>
              <SearchInput
                type="text"
                placeholder="Search boards by name, manufacturer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchSection>

            <BoardsList>
              {loading ? (
                <LoadingState>Loading boards...</LoadingState>
              ) : filteredBoards.length === 0 ? (
                <EmptyState>
                  {searchTerm ? 'No boards found matching your search.' : 'No other boards available for comparison.'}
                </EmptyState>
              ) : (
                filteredBoards.map((board) => (
                  <BoardItem
                    key={board.id}
                    selected={selectedBoards.has(board.id)}
                    onClick={() => toggleBoardSelection(board.id)}
                  >
                    <Checkbox checked={selectedBoards.has(board.id)}>
                      {selectedBoards.has(board.id) && <Check size={12} />}
                    </Checkbox>
                    <span style={{ fontSize: '24px' }}>{getBoardIcon(board.name)}</span>
                    <BoardInfo>
                      <BoardName>{board.name}</BoardName>
                      <BoardDetails>
                        {board.manufacturer} • {board.pin_count} pins • {board.package_type}
                      </BoardDetails>
                    </BoardInfo>
                  </BoardItem>
                ))
              )}
            </BoardsList>
          </ModalBody>

          <ModalFooter>
            <SelectionCount>
              {selectedBoards.size === 0 
                ? 'Select boards to compare with ' + currentBoard.name
                : `${selectedBoards.size} board${selectedBoards.size !== 1 ? 's' : ''} selected`
              }
            </SelectionCount>
            <CompareButton
              onClick={handleCompare}
              disabled={selectedBoards.size === 0}
            >
              <GitCompare size={16} />
              Compare {selectedBoards.size > 0 ? `(${selectedBoards.size + 1} boards)` : ''}
            </CompareButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default CompareModal;
