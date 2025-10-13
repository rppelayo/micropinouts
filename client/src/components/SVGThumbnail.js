import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Cpu } from 'lucide-react';

const ThumbnailContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
  }
  
  /* Debug styling - make container more visible */
  &:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DefaultIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const SVGThumbnail = ({ svgContent, boardName, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    console.log('SVGThumbnail render:', { 
      boardName, 
      hasSvgContent: !!svgContent, 
      svgType: typeof svgContent,
      svgLength: svgContent ? svgContent.length : 0,
      svgPreview: svgContent ? svgContent.substring(0, 100) : 'null'
    });
    
    if (!svgContent || svgContent === null || svgContent === '') {
      console.log('No SVG content for', boardName, 'Content:', svgContent);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Create a temporary div to parse the SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgContent;
      const svgElement = tempDiv.querySelector('svg');
      
      if (!svgElement) {
        console.log('No SVG element found in content for', boardName);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Clone the SVG element
      const clonedSvg = svgElement.cloneNode(true);
      
      // Set thumbnail dimensions
      clonedSvg.setAttribute('width', '48');
      clonedSvg.setAttribute('height', '48');
      
      // Ensure viewBox exists and is appropriate for thumbnail
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        clonedSvg.setAttribute('viewBox', viewBox);
      } else {
        // Try to get width and height from original SVG
        const width = svgElement.getAttribute('width') || '100';
        const height = svgElement.getAttribute('height') || '100';
        clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      
      // Add styles to make SVG more visible in thumbnail
      const style = document.createElement('style');
      style.textContent = `
        svg {
          background: transparent !important;
        }
        * {
          stroke-width: 1 !important;
          fill: #333 !important;
          stroke: #666 !important;
        }
        .pin-hole, [class*="pin"] {
          fill: #3b82f6 !important;
          stroke: #1e40af !important;
        }
        text {
          font-size: 8px !important;
          fill: #333 !important;
        }
      `;
      clonedSvg.appendChild(style);
      
      // Remove any existing content in the container
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
        svgRef.current.appendChild(clonedSvg);
        
        // Debug: Check what was actually rendered
        const renderedSvg = svgRef.current.querySelector('svg');
        if (renderedSvg) {
          console.log('SVG thumbnail rendered successfully for', boardName, {
            width: renderedSvg.getAttribute('width'),
            height: renderedSvg.getAttribute('height'),
            viewBox: renderedSvg.getAttribute('viewBox'),
            hasContent: renderedSvg.children.length > 0,
            childCount: renderedSvg.children.length
          });
          
          // Check if SVG is visible (has visible elements)
          const visibleElements = renderedSvg.querySelectorAll('rect, circle, path, line, polygon, text');
          console.log('Visible elements found:', visibleElements.length);
          
          // If no visible elements, try to create a simple fallback
          if (visibleElements.length === 0) {
            console.log('No visible elements found, creating fallback for', boardName);
            const fallbackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            fallbackSvg.setAttribute('width', '48');
            fallbackSvg.setAttribute('height', '48');
            fallbackSvg.setAttribute('viewBox', '0 0 100 100');
            
            // Create a simple board representation
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '10');
            rect.setAttribute('y', '10');
            rect.setAttribute('width', '80');
            rect.setAttribute('height', '80');
            rect.setAttribute('fill', '#f0f0f0');
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '2');
            fallbackSvg.appendChild(rect);
            
            // Add some pin indicators
            for (let i = 0; i < 4; i++) {
              const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              pin.setAttribute('cx', 20 + (i * 20));
              pin.setAttribute('cy', 20);
              pin.setAttribute('r', '3');
              pin.setAttribute('fill', '#3b82f6');
              fallbackSvg.appendChild(pin);
            }
            
            svgRef.current.innerHTML = '';
            svgRef.current.appendChild(fallbackSvg);
          }
        } else {
          console.log('SVG element not found after rendering for', boardName);
        }
      }
      
      setIsLoading(false);
      setHasError(false);
    } catch (error) {
      console.error('Error rendering SVG thumbnail for', boardName, ':', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [svgContent, boardName]);

  if (isLoading) {
    return (
      <ThumbnailContainer className={className}>
        <LoadingSpinner />
      </ThumbnailContainer>
    );
  }

  if (hasError) {
    return (
      <ThumbnailContainer className={className}>
        <DefaultIcon>
          <Cpu size={24} />
        </DefaultIcon>
      </ThumbnailContainer>
    );
  }

  return (
    <ThumbnailContainer className={className} title={`SVG Thumbnail for ${boardName}`}>
      <div ref={svgRef} />
    </ThumbnailContainer>
  );
};

export default SVGThumbnail;
