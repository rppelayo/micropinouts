import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { boardsAPI, pinGroupsAPI } from '../services/api';
import SVGViewer from '../components/SVGViewer';

const EmbedContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
`;

const BackLink = styled.a`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: #3b82f6;
    transform: translateX(-50%) translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }
`;

const BackLinkLogo = styled.img`
  height: 16px;
  width: auto;
`;

const PinoutContainer = styled.div`
  height: 100vh;
  position: relative;
`;

const PinInfoOverlay = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  max-width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
`;

const PinInfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

const PinInfoSubtitle = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
`;

const PinInfoContent = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

const PinInfoSection = styled.div`
  background: #f1f5f9;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 1.4;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  /* Preserve rich text formatting */
  h1, h2, h3, h4, h5, h6 {
    margin: 8px 0 4px 0;
    font-weight: 600;
    color: #1e293b;
    font-size: 12px;
  }
  
  p {
    margin: 4px 0;
  }
  
  ul, ol {
    margin: 4px 0;
    padding-left: 16px;
  }
  
  li {
    margin: 2px 0;
  }
  
  blockquote {
    border-left: 2px solid #3b82f6;
    padding-left: 8px;
    margin: 8px 0;
    font-style: italic;
    color: #64748b;
  }
  
  code {
    background: #e2e8f0;
    padding: 1px 3px;
    border-radius: 2px;
    font-family: 'Courier New', monospace;
    font-size: 10px;
  }
  
  pre {
    background: #e2e8f0;
    padding: 6px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 8px 0;
  }
  
  pre code {
    background: none;
    padding: 0;
  }
  
  a {
    color: #3b82f6;
    text-decoration: underline;
  }
  
  a:hover {
    color: #2563eb;
  }
  
  strong {
    font-weight: 600;
    color: #1e293b;
  }
  
  em {
    font-style: italic;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
  }
`;

const PinInfoSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

const PinInfoSpec = styled.div`
  font-size: 11px;
  
  strong {
    color: #374151;
  }
`;

const PinInfoClose = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  
  &:hover {
    color: #6b7280;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #ef4444;
  font-size: 14px;
`;

const EmbedBoard = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [boardResponse, pinsResponse] = await Promise.all([
        boardsAPI.getById(id),
        boardsAPI.getPins(id)
      ]);
      
      setBoard(boardResponse.data);
      setPins(pinsResponse.data);
    } catch (err) {
      console.error('Error fetching board data:', err);
      setError('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <EmbedContainer>
        <LoadingSpinner>Loading board...</LoadingSpinner>
      </EmbedContainer>
    );
  }

  if (error || !board) {
    return (
      <EmbedContainer>
        <ErrorMessage>{error || 'Board not found'}</ErrorMessage>
      </EmbedContainer>
    );
  }

  return (
    <EmbedContainer>
      <BackLink href={`${window.location.origin}/micropinouts/board/${id}`} target="_blank">
        <ArrowLeft size={14} />
        View on
        <BackLinkLogo src="/micropinouts/logo.png" alt="MicroPinouts" />
      </BackLink>
      
      <PinoutContainer>
        <SVGViewer
          svgContent={board.svg_content}
          onPinClick={handleSVGPinClick}
          enableZoom={true}
          enablePan={true}
          style={{ height: '100%', width: '100%' }}
        />
        
        <PinInfoOverlay show={!!selectedPin}>
          {selectedPin && (
            <>
              <PinInfoClose onClick={() => setSelectedPin(null)}>
                ×
              </PinInfoClose>
              <PinInfoTitle>{selectedPin.pin_name}</PinInfoTitle>
              <PinInfoSubtitle>Pin {selectedPin.pin_number}</PinInfoSubtitle>
              
              <PinInfoContent>
                {selectedPin.functions && (
                  <PinInfoSection>
                    <strong>Primary Function:</strong><br />
                    {selectedPin.functions}
                  </PinInfoSection>
                )}
                
                {selectedPin.alternate_functions && (
                  <PinInfoSection>
                    <strong>Alternate Functions:</strong><br />
                    {selectedPin.alternate_functions}
                  </PinInfoSection>
                )}
                
                {(selectedPin.voltage_range || selectedPin.current_rating || selectedPin.frequency_range) && (
                  <PinInfoSpecs>
                    {selectedPin.voltage_range && (
                      <PinInfoSpec>
                        <strong>Voltage:</strong><br />
                        {selectedPin.voltage_range}
                      </PinInfoSpec>
                    )}
                    {selectedPin.current_rating && (
                      <PinInfoSpec>
                        <strong>Current:</strong><br />
                        {selectedPin.current_rating}
                      </PinInfoSpec>
                    )}
                    {selectedPin.frequency_range && (
                      <PinInfoSpec>
                        <strong>Frequency:</strong><br />
                        {selectedPin.frequency_range}
                      </PinInfoSpec>
                    )}
                  </PinInfoSpecs>
                )}
                
                {selectedPin.description && (
                  <PinInfoSection>
                    <strong>Description:</strong><br />
                    <div dangerouslySetInnerHTML={{ __html: selectedPin.description }} />
                  </PinInfoSection>
                )}
                
                {!selectedPin.functions && !selectedPin.alternate_functions && !selectedPin.description && !selectedPin.voltage_range && !selectedPin.current_rating && !selectedPin.frequency_range && (
                  <PinInfoSection>
                    No additional information available
                  </PinInfoSection>
                )}
              </PinInfoContent>
            </>
          )}
        </PinInfoOverlay>
      </PinoutContainer>
    </EmbedContainer>
  );
};

export default EmbedBoard;
