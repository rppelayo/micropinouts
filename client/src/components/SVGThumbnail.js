import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Cpu } from 'lucide-react';

const ThumbnailContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
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
    console.log('SVGThumbnail render:', { boardName, hasSvgContent: !!svgContent, svgType: typeof svgContent });
    
    if (!svgContent || svgContent === null) {
      console.log('No SVG content for', boardName);
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
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Clone the SVG element
      const clonedSvg = svgElement.cloneNode(true);
      
      // Set thumbnail dimensions
      clonedSvg.setAttribute('width', '48');
      clonedSvg.setAttribute('height', '48');
      clonedSvg.setAttribute('viewBox', svgElement.getAttribute('viewBox') || '0 0 100 100');
      
      // Remove any existing content in the container
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
        svgRef.current.appendChild(clonedSvg);
      }
      
      setIsLoading(false);
      setHasError(false);
    } catch (error) {
      console.error('Error rendering SVG thumbnail:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [svgContent]);

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
    <ThumbnailContainer className={className}>
      <div ref={svgRef} />
    </ThumbnailContainer>
  );
};

export default SVGThumbnail;
