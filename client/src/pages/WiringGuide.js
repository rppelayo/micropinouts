import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const WiringGuideContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
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
  margin-bottom: 20px;
`;

const Description = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  
  p {
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }
`;

const PinConnections = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const PinConnectionsTitle = styled.h3`
  color: #1f2937;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const PinTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const PinTableHeader = styled.thead`
  background: #f9fafb;
`;

const PinTableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  
  &:first-child {
    border-top-left-radius: 6px;
  }
  
  &:last-child {
    border-top-right-radius: 6px;
  }
`;

const PinTableBody = styled.tbody``;

const PinTableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const PinTableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  
  &:first-child {
    font-weight: 500;
    color: #1f2937;
  }
  
  &:last-child {
    font-weight: 500;
    color: #1f2937;
  }
`;

const PinConnection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
`;

const PinArrow = styled.span`
  color: #9ca3af;
  font-weight: bold;
`;

const SVGContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-height: 600px;
`;

const SVGHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  min-height: 60px;
  flex-shrink: 0;
`;

const SVGContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SVGWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
`;

const SVGInner = styled.div`
  transform: ${props => `translate(${props.panX + props.offsetX}px, ${props.panY + props.offsetY}px) scale(${props.zoomLevel})`};
  transform-origin: center center;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ZoomIndicator = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 60px;
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

const WiringGuide = () => {
  const { slug } = useParams();
  const [wiringGuide, setWiringGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  
  // Pan/Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [svgOffset, setSvgOffset] = useState({ x: 0, y: 0 });

  // Pan/Zoom functions
  const zoomWiringGuide = useCallback((factor) => {
    setZoomLevel(prev => Math.max(0.1, Math.min(5, prev * factor)));
  }, []);

  const calculateSVGCenter = useCallback((svgContent) => {
    if (!svgContent || !containerRef.current) return { x: 0, y: 0 };
    
    // Parse SVG dimensions from the content
    const svgMatch = svgContent.match(/<svg[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*>/);
    if (!svgMatch) return { x: 0, y: 0 };
    
    const svgWidth = parseFloat(svgMatch[1]);
    const svgHeight = parseFloat(svgMatch[2]);
    
    // Get container dimensions
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Calculate offset to center the SVG
    const offsetX = (containerWidth - svgWidth) / 2;
    const offsetY = (containerHeight - svgHeight) / 2;
    
    return { x: offsetX, y: offsetY };
  }, []);

  const fetchWiringGuide = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api-php/wiring-guide/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setWiringGuide(data);
        setError(null);
        
        // Calculate SVG centering offset after a short delay to ensure container is rendered
        setTimeout(() => {
          const offset = calculateSVGCenter(data.svg_content);
          setSvgOffset(offset);
        }, 100);
      } else {
        setError('Wiring guide not found');
      }
    } catch (err) {
      console.error('Error fetching wiring guide:', err);
      setError('Failed to load wiring guide');
    } finally {
      setLoading(false);
    }
  }, [slug, calculateSVGCenter]);

  useEffect(() => {
    fetchWiringGuide();
  }, [fetchWiringGuide]);

  // Add wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoomWiringGuide(delta);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoomWiringGuide]);

  const resetWiringGuideZoom = useCallback(() => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    // Recalculate centering offset
    if (wiringGuide?.svg_content) {
      const offset = calculateSVGCenter(wiringGuide.svg_content);
      setSvgOffset(offset);
    }
  }, [wiringGuide, calculateSVGCenter]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  if (loading) {
    return (
      <WiringGuideContainer>
        <LoadingContainer>Loading wiring guide...</LoadingContainer>
      </WiringGuideContainer>
    );
  }

  if (error) {
    return (
      <WiringGuideContainer>
        <ErrorContainer>{error}</ErrorContainer>
      </WiringGuideContainer>
    );
  }

  if (!wiringGuide) {
    return (
      <WiringGuideContainer>
        <ErrorContainer>Wiring guide not found</ErrorContainer>
      </WiringGuideContainer>
    );
  }

  return (
    <WiringGuideContainer>
      <Header>
        <Title>{wiringGuide.sensor_name} → {wiringGuide.microcontroller_name}</Title>
        <Subtitle>Wiring Guide</Subtitle>
        {wiringGuide.description && (
          <Description>
            <p>{wiringGuide.description}</p>
          </Description>
        )}
      </Header>

      <PinConnections>
        <PinConnectionsTitle>Pin Connections</PinConnectionsTitle>
        <PinTable>
          <PinTableHeader>
            <tr>
              <PinTableHeaderCell>Sensor Board Pin</PinTableHeaderCell>
              <PinTableHeaderCell>Connection</PinTableHeaderCell>
              <PinTableHeaderCell>Microcontroller Pin</PinTableHeaderCell>
            </tr>
          </PinTableHeader>
          <PinTableBody>
            {wiringGuide.connections && wiringGuide.connections.map((connection, index) => (
              <PinTableRow key={index}>
                <PinTableCell>{connection.sensorPin}</PinTableCell>
                <PinTableCell>
                  <PinConnection>
                    <PinArrow>→</PinArrow>
                  </PinConnection>
                </PinTableCell>
                <PinTableCell>{connection.microcontrollerPin}</PinTableCell>
              </PinTableRow>
            ))}
          </PinTableBody>
        </PinTable>
      </PinConnections>

      <SVGContainer>
        <SVGHeader>
          <ZoomIndicator>
            {Math.round(zoomLevel * 100)}%
          </ZoomIndicator>
          
          <Controls>
            <ControlButton
              onClick={() => zoomWiringGuide(1.2)}
              title="Zoom In"
            >
              +
            </ControlButton>
            <ControlButton
              onClick={() => zoomWiringGuide(0.8)}
              title="Zoom Out"
            >
              −
            </ControlButton>
            <ControlButton
              onClick={resetWiringGuideZoom}
              title="Reset Zoom"
            >
              ⌂
            </ControlButton>
          </Controls>
        </SVGHeader>
        
        <SVGContent>
          <SVGWrapper
            ref={containerRef}
            isDragging={isDragging}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <SVGInner
              panX={panX}
              panY={panY}
              zoomLevel={zoomLevel}
              offsetX={svgOffset.x}
              offsetY={svgOffset.y}
              dangerouslySetInnerHTML={{ __html: wiringGuide.svg_content }}
            />
          </SVGWrapper>
        </SVGContent>
      </SVGContainer>
    </WiringGuideContainer>
  );
};

export default WiringGuide;
