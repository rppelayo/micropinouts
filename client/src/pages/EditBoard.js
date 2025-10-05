import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Edit3, X } from 'lucide-react';
import { boardsAPI, pinGroupsAPI } from '../services/api';

const EditBoardContainer = styled.div`
  padding: 40px 0;
  max-width: 1200px;
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const BoardPreview = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const PreviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const SVGContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
`;

const PinEditor = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-height: 600px;
  overflow-y: auto;
`;

const EditorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PinList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PinItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f1f5f9;
  }
`;

const PinHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const PinName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
`;

const PinNumber = styled.div`
  font-size: 14px;
  color: #64748b;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
`;

const PinDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  resize: vertical;
  min-height: 60px;
  max-height: 100px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  word-wrap: break-word;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ActionButtons = styled.div`
  background: white;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  
  ${props => props.primary && `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${props => props.secondary && `
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 18px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const BoardInfoSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const BoardInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BoardInfoTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const EditBoardButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const BoardInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BoardInfoField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BoardInfoLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const BoardInfoInput = styled.input`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
`;

const BoardInfoTextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
`;

const BoardInfoDisplay = styled.div`
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  min-height: 20px;
  white-space: pre-wrap;
`;

const BoardInfoActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const BoardInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    
    &:hover {
      background: #2563eb;
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    &:hover {
      background: #f3f4f6;
    }
  }
`;


const EditBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [pinGroups, setPinGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingBoard, setEditingBoard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get admin token from localStorage
        const token = localStorage.getItem('adminToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [boardResponse, pinsResponse, groupsResponse] = await Promise.all([
          fetch(`/api/admin/boards/${id}`, { headers }).then(res => res.json()),
          fetch(`/api/admin/boards/${id}/pins`, { headers }).then(res => res.json()),
          fetch(`/api/admin/pin-groups`, { headers }).then(res => res.json())
        ]);
        
        // Extract data from API responses
        const boardData = boardResponse.data || boardResponse;
        const pinsData = pinsResponse.data || pinsResponse;
        const groupsData = groupsResponse.data || groupsResponse;
        
        console.log('Board data:', boardData);
        console.log('Pins data:', pinsData);
        console.log('Groups data:', groupsData);
        console.log('Board SVG content:', boardData?.svg_content ? 'Present' : 'Missing');
        
        setBoard(boardData);
        setPins(Array.isArray(pinsData) ? pinsData : []);
        setPinGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        setError('Failed to load board data');
        console.error('Error fetching data:', err);
        setPins([]); // Ensure pins is always an array
        setPinGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePinUpdate = (pinId, field, value) => {
    setPins(prevPins => 
      prevPins.map(pin => 
        pin.id === pinId 
          ? { ...pin, [field]: value }
          : pin
      )
    );
  };

  const handleBoardUpdate = (field, value) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      [field]: value
    }));
  };

  const handleSaveBoard = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`/api/admin/boards/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: board.name,
          description: board.description,
          manufacturer: board.manufacturer,
          package_type: board.package_type,
          voltage_range: board.voltage_range,
          clock_speed: board.clock_speed,
          flash_memory: board.flash_memory,
          ram: board.ram
        })
      });

      if (response.ok) {
        setSuccess('Board information updated successfully!');
        setEditingBoard(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update board information');
      }
    } catch (err) {
      setError('Failed to update board information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Update each pin
      const pinsToUpdate = pins || [];
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      for (const pin of pinsToUpdate) {
        await fetch(`/api/admin/pins/${pin.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            pin_name: pin.pin_name,
            pin_group_id: pin.pin_group_id,
            functions: pin.functions,
            alternate_functions: pin.alternate_functions,
            description: pin.description,
            voltage_range: pin.voltage_range,
            current_limit: pin.current_limit
          })
        });
      }
      
      setSuccess('Board updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save changes');
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };


  const handleSVGPinClick = (event) => {
    const target = event.target;
    
    if (target.classList && target.classList.contains('pin-hole')) {
      const pinName = target.getAttribute('data-pin');
      
      if (pinName && pins) {
        const pin = pins.find(p => p.pin_name === pinName);
        if (pin) {
          // Scroll to pin in editor
          const pinElement = document.getElementById(`pin-${pin.id}`);
          if (pinElement) {
            pinElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            pinElement.style.background = '#dbeafe';
            setTimeout(() => {
              pinElement.style.background = '';
            }, 2000);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <EditBoardContainer>
        <LoadingSpinner>Loading board data...</LoadingSpinner>
      </EditBoardContainer>
    );
  }

  if (!board) {
    return (
      <EditBoardContainer>
        <ErrorMessage>Board not found</ErrorMessage>
      </EditBoardContainer>
    );
  }

  return (
    <EditBoardContainer>
      <BackButton onClick={() => navigate(`/boards/${id}`)}>
        <ArrowLeft size={20} />
        Back to Board
      </BackButton>

      <Header>
        <Title>Edit Board: {board.name}</Title>
        <Subtitle>Edit pin categories, alternate functions, and board details</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <BoardInfoSection>
        <BoardInfoHeader>
          <BoardInfoTitle>Board Information</BoardInfoTitle>
          <EditBoardButton 
            onClick={() => setEditingBoard(!editingBoard)}
            disabled={saving}
          >
            <Edit3 size={16} />
            {editingBoard ? 'Cancel Edit' : 'Edit Board Info'}
          </EditBoardButton>
        </BoardInfoHeader>

        <BoardInfoGrid>
          <BoardInfoField>
            <BoardInfoLabel>Board Name</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.name || ''}
                onChange={(e) => handleBoardUpdate('name', e.target.value)}
                placeholder="Enter board name"
              />
            ) : (
              <BoardInfoDisplay>{board.name || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>Manufacturer</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.manufacturer || ''}
                onChange={(e) => handleBoardUpdate('manufacturer', e.target.value)}
                placeholder="Enter manufacturer"
              />
            ) : (
              <BoardInfoDisplay>{board.manufacturer || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>Package Type</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.package_type || ''}
                onChange={(e) => handleBoardUpdate('package_type', e.target.value)}
                placeholder="Enter package type"
              />
            ) : (
              <BoardInfoDisplay>{board.package_type || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>Voltage Range</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.voltage_range || ''}
                onChange={(e) => handleBoardUpdate('voltage_range', e.target.value)}
                placeholder="e.g., 3.3V, 5V"
              />
            ) : (
              <BoardInfoDisplay>{board.voltage_range || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>Clock Speed</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.clock_speed || ''}
                onChange={(e) => handleBoardUpdate('clock_speed', e.target.value)}
                placeholder="e.g., 16MHz, 48MHz"
              />
            ) : (
              <BoardInfoDisplay>{board.clock_speed || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>Flash Memory</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.flash_memory || ''}
                onChange={(e) => handleBoardUpdate('flash_memory', e.target.value)}
                placeholder="e.g., 32KB, 256KB"
              />
            ) : (
              <BoardInfoDisplay>{board.flash_memory || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField>
            <BoardInfoLabel>RAM</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoInput
                type="text"
                value={board.ram || ''}
                onChange={(e) => handleBoardUpdate('ram', e.target.value)}
                placeholder="e.g., 2KB, 32KB"
              />
            ) : (
              <BoardInfoDisplay>{board.ram || 'Not specified'}</BoardInfoDisplay>
            )}
          </BoardInfoField>

          <BoardInfoField style={{ gridColumn: '1 / -1' }}>
            <BoardInfoLabel>Description</BoardInfoLabel>
            {editingBoard ? (
              <BoardInfoTextArea
                value={board.description || ''}
                onChange={(e) => handleBoardUpdate('description', e.target.value)}
                placeholder="Enter board description"
                rows={4}
              />
            ) : (
              <BoardInfoDisplay>{board.description || 'No description available'}</BoardInfoDisplay>
            )}
          </BoardInfoField>
        </BoardInfoGrid>

        {editingBoard && (
          <BoardInfoActions>
            <BoardInfoButton 
              className="secondary"
              onClick={() => setEditingBoard(false)}
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </BoardInfoButton>
            <BoardInfoButton 
              className="primary"
              onClick={handleSaveBoard}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Board Info'}
            </BoardInfoButton>
          </BoardInfoActions>
        )}
      </BoardInfoSection>

      <ContentGrid>
        <BoardPreview>
          <PreviewTitle>Board Preview</PreviewTitle>
          <SVGContainer
            onClick={handleSVGPinClick}
            dangerouslySetInnerHTML={{
              __html: board.svg_content?.replace(
                /<svg([^>]*)>/i,
                '<svg$1 style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;">'
              ) || '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;">No SVG content available</div>'
            }}
          />
        </BoardPreview>

        <div>
          <ActionButtons>
            <Button secondary onClick={() => navigate(`/boards/${id}`)}>
              <X size={16} />
              Cancel
            </Button>
            <Button primary onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </ActionButtons>

          <PinEditor>
            <EditorTitle>
              Pin Configuration
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b' }}>
                {(pins || []).length} pins
              </span>
            </EditorTitle>

            <PinList>
              {(pins || []).map(pin => (
                <PinItem key={pin.id} id={`pin-${pin.id}`}>
                  <PinHeader>
                    <PinName>{pin.pin_name || `Pin ${pin.pin_number}`}</PinName>
                    <PinNumber>#{pin.pin_number}</PinNumber>
                  </PinHeader>
                  
                  <PinDetails>
                    <FormGroup>
                      <Label>Category</Label>
                      <Select
                        value={pin.pin_group_id || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'pin_group_id', e.target.value ? parseInt(e.target.value) : null)}
                      >
                        <option value="">Select Category</option>
                        {pinGroups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>Current Limit</Label>
                      <Input
                        value={pin.current_limit || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'current_limit', e.target.value)}
                        placeholder="e.g., 20mA"
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>Primary Function</Label>
                      <Input
                        value={pin.functions || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'functions', e.target.value)}
                        placeholder="e.g., Digital I/O"
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>Voltage Range</Label>
                      <Input
                        value={pin.voltage_range || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'voltage_range', e.target.value)}
                        placeholder="e.g., 0-3.3V"
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>Alternate Functions</Label>
                      <TextArea
                        value={pin.alternate_functions || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'alternate_functions', e.target.value)}
                        placeholder="e.g., SPI MOSI, I2C SDA, PWM, ADC"
                      />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                      <Label>Description</Label>
                      <TextArea
                        value={pin.description || ''}
                        onChange={(e) => handlePinUpdate(pin.id, 'description', e.target.value)}
                        placeholder="Additional pin information..."
                      />
                    </FormGroup>
                  </PinDetails>
                </PinItem>
              ))}
            </PinList>
          </PinEditor>
        </div>
      </ContentGrid>
    </EditBoardContainer>
  );
};

export default EditBoard;
