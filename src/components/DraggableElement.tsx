import { useState, useRef, useEffect } from 'react';
import type { PictureElement } from '../types/ha-types';
import { useDrag } from '@use-gesture/react';
import styled from 'styled-components';

const ElementContainer = styled.div<{ $left: string; $top: string }>`
  position: absolute;
  cursor: move;
  user-select: none;
  display: block;
  left: ${props => props.$left};
  top: ${props => props.$top};
  touch-action: none;
  transform-origin: top left;
  will-change: transform;
  backface-visibility: hidden;
  box-sizing: content-box; /* Use content-box for more predictable sizing */
  overflow: visible;
  z-index: 10;
  contain: layout; /* Optimize for layout changes */
`;

interface DraggableElementProps {
  element: PictureElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDragStop: (newLeft: string, newTop: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  showPlaceholders?: boolean;
}

export const DraggableElement = ({ element, containerRef, onDragStop, onDragStart, onDragEnd, showPlaceholders = true }: DraggableElementProps) => {
  const [{ left, top }, setPosition] = useState(() => {
    return {
      left: element.style.left,
      top: element.style.top
    };
  });
  const elementRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [dragStartPosition, setDragStartPosition] = useState<{ left: number; top: number } | null>(null);

  // Track container dimensions for consistent sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);

  // Watch for changes in element's style position
  useEffect(() => {
    setPosition({
      left: element.style.left,
      top: element.style.top
    });
  }, [element.style.left, element.style.top]);

  const bind = useDrag(({ xy: [x, y], initial: [initialX, initialY], first, last, event }) => {
    if (!containerRef.current) return;
    event.preventDefault();
    
    if (first) {
      // Capture the current position when drag starts
      const currentLeft = parseFloat(left) || 0;
      const currentTop = parseFloat(top) || 0;
      setDragStartPosition({ left: currentLeft, top: currentTop });
      
      // Call drag start callback for highlighting
      onDragStart?.();
      return;
    }

    if (last) {
      // Clear drag start position and call drag end callback
      setDragStartPosition(null);
      onDragEnd?.();
    }

    // Use the captured start position
    if (!dragStartPosition) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const sensitivity = 0.2; // Reduce sensitivity (lower number = less sensitive)

    // Calculate movement delta in pixels from initial position
    const deltaX = x - initialX;
    const deltaY = y - initialY;

    // Convert pixel delta to percentage delta
    const deltaXPercent = (deltaX / containerRect.width) * 100;
    const deltaYPercent = (deltaY / containerRect.height) * 100;

    // Calculate new position by adding delta to start position
    let newX = dragStartPosition.left + deltaXPercent;
    let newY = dragStartPosition.top + deltaYPercent;

    // Apply bounds first to prevent overflow issues
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    // TEMPORARY: Remove all corrections to test if the issue is the correction itself
    // If positioning is still off without corrections, the issue is in the container setup
    
    // Round to reduce jitter with fixed decimal precision
    const boundedX = Number((Math.round(newX / sensitivity) * sensitivity).toFixed(1));
    const boundedY = Number((Math.round(newY / sensitivity) * sensitivity).toFixed(1));

    const newLeft = `${boundedX}%`;
    const newTop = `${boundedY}%`;

    // Debug logging to track the positioning issue
    if (element.type === 'state-label' || element.type === 'image') {
      console.log(`Element ${element.type} - Start: ${dragStartPosition.left}%, Delta: ${deltaXPercent.toFixed(1)}%, Final X: ${boundedX}%, Width: ${element.style.width}`);
    }

    setPosition({ left: newLeft, top: newTop });
    
    if (last) {
      onDragStop(newLeft, newTop);
    }
  }, {
    threshold: 5, // Add a small threshold to prevent accidental drags
  });

  const getPlaceholderValue = (entity: string, prefix?: string): string => {
    // Generate placeholder values based on entity type
    if (entity.includes('_temp')) {
      // Temperature sensor: 🌡️30.9 °C
      return `🌡️30.9 °C`;
    } else if (entity.includes('_humidity')) {
      // Humidity sensor: 1 💧76.0%
      const id = prefix?.replace(' 💧', '') || '1'; // Extract ID from prefix
      return `${id} 💧76.0%`;
    }
    // Fallback to original entity if pattern doesn't match
    return `${prefix || ''} ${entity}`;
  };

  const renderContent = () => {
    switch (element.type) {
      case 'state-label':
        const fontSize = element.style['font-size']?.replace(/(\d+)px/, (_, size) => `${Number(size) * 1.4}px`);
        return (
          <span style={{ color: element.style.color, fontSize }}>
            {showPlaceholders 
              ? getPlaceholderValue(element.entity, element.prefix)
              : `${element.prefix || ''} ${element.entity}`
            }
          </span>
        );
      case 'image':
        // Calculate pixel width from percentage to prevent scaling issues
        const getImageWidth = () => {
          if (!element.style.width || !containerDimensions.width) {
            return 'auto';
          }
          
          // If it's a percentage, convert to pixels for stable sizing
          if (element.style.width.includes('%')) {
            const percentage = parseFloat(element.style.width);
            // Apply scaling factor: make 15% display as 12% (12/15 = 0.8)
            const scalingFactor = 0.8;
            const adjustedPercentage = percentage * scalingFactor;
            const pixelWidth = (adjustedPercentage / 100) * containerDimensions.width;
            return `${pixelWidth}px`;
          }
          
          // If it's already pixels or other units, use as-is
          return element.style.width;
        };

        return (
          <img
            src={element.image}
            alt={element.entity}
            style={{ 
              width: getImageWidth(),
              height: 'auto',
              pointerEvents: 'none', // Prevent image from interfering with drag
              display: 'block', // Ensure consistent block behavior
              objectFit: 'contain', // Maintain aspect ratio like HA
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ElementContainer
      ref={elementRef}
      {...bind()}
      $left={left}
      $top={top}
    >
      {renderContent()}
    </ElementContainer>
  );
};
