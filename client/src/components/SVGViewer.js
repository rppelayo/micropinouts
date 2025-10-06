import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
`;

const ViewerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
  min-height: 60px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    min-height: 50px;
  }
`;

const ViewerContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
`;

const SVGContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: ${props => props.isPanning ? 'grabbing' : 'grab'};
  user-select: none;
  touch-action: none; /* Prevent default touch behaviors */
  
  svg {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    pointer-events: all; /* Ensure SVG captures mouse events */
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #475569;
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ZoomLevel = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(4px);
`;

const PanIndicator = styled.div`
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  display: ${props => props.show ? 'block' : 'none'};
`;

const SVGViewer = ({ 
  svgContent, 
  onPinClick, 
  className,
  initialZoom = 1,
  minZoom = 0.1,
  maxZoom = 5,
  enablePan = true,
  enableZoom = true
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showPanIndicator, setShowPanIndicator] = useState(false);
  const [panModeEnabled, setPanModeEnabled] = useState(false);

  // Apply zoom and pan transformations
  useEffect(() => {
    if (svgRef.current) {
      const svg = svgRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
        svg.style.transformOrigin = 'center center';
      }
    }
  }, [zoom, pan]);

  // Handle zoom in
  const handleZoomIn = () => {
    if (enableZoom && zoom < maxZoom) {
      setZoom(prev => Math.min(prev * 1.2, maxZoom));
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (enableZoom && zoom > minZoom) {
      setZoom(prev => Math.max(prev / 1.2, minZoom));
    }
  };

  // Handle reset view
  const handleReset = () => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  };

  // Handle pan mode toggle
  const handlePanModeToggle = () => {
    setPanModeEnabled(!panModeEnabled);
    if (isPanning) {
      setIsPanning(false);
      setShowPanIndicator(false);
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    if (!enableZoom) return;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * delta));
    
    // Only prevent default if zoom actually changes (not at limits)
    if (newZoom !== zoom) {
      e.preventDefault();
      e.stopPropagation();
      setZoom(newZoom);
    }
  };

  // Handle pan start
  const handleMouseDown = (e) => {
    if (!enablePan || !panModeEnabled) return;
    
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
    setShowPanIndicator(true);
  };

  // Handle pan move
  const handleMouseMove = (e) => {
    if (!isPanning || !enablePan) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
    setShowPanIndicator(false);
  };

  // Handle click events (for pin interactions)
  const handleClick = (e) => {
    if (isPanning) {
      e.preventDefault();
      return;
    }
    
    if (onPinClick) {
      onPinClick(e);
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    if (!enablePan || !panModeEnabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setIsPanning(true);
    setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    setShowPanIndicator(true);
  };

  const handleTouchMove = (e) => {
    if (!isPanning || !enablePan || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastPanPoint.x;
    const deltaY = touch.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setShowPanIndicator(false);
  };

  // Add global event listeners for pan
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isPanning, lastPanPoint]);

  // Add wheel event listener to container with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelWithOptions = (e) => {
      handleWheel(e);
    };

    // Add event listener with passive: false to ensure preventDefault works
    container.addEventListener('wheel', handleWheelWithOptions, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelWithOptions);
    };
  }, [enableZoom, zoom, minZoom, maxZoom]);

  return (
    <ViewerContainer className={className}>
      <ViewerHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ZoomLevel>
            {Math.round(zoom * 100)}%
          </ZoomLevel>
          <PanIndicator show={showPanIndicator && panModeEnabled}>
            Pan Mode Active
          </PanIndicator>
        </div>
        
        <ControlsContainer>
          {enableZoom && (
            <>
              <ControlButton
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
                title="Zoom In"
              >
                <ZoomIn />
              </ControlButton>
              <ControlButton
                onClick={handleZoomOut}
                disabled={zoom <= minZoom}
                title="Zoom Out"
              >
                <ZoomOut />
              </ControlButton>
            </>
          )}
          <ControlButton
            onClick={handleReset}
            title="Reset View"
          >
            <RotateCcw />
          </ControlButton>
          {enablePan && (
            <ControlButton
              onClick={handlePanModeToggle}
              title={panModeEnabled ? "Disable Pan Mode" : "Enable Pan Mode (Click to toggle, then drag to pan)"}
              style={{
                background: panModeEnabled ? '#3b82f6' : 'white',
                color: panModeEnabled ? 'white' : '#475569'
              }}
            >
              <Move />
            </ControlButton>
          )}
        </ControlsContainer>
      </ViewerHeader>

      <ViewerContent>
        <SVGContainer
          ref={containerRef}
          isPanning={isPanning}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
        >
          <div
            ref={svgRef}
            dangerouslySetInnerHTML={{
              __html: svgContent?.replace(
                /<svg([^>]*)>/i,
                '<svg$1 style="width: 100%; height: 100%; max-width: none; max-height: none;">'
              ) || '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;">No SVG content available</div>'
            }}
          />
        </SVGContainer>
      </ViewerContent>
    </ViewerContainer>
  );
};

export default SVGViewer;

