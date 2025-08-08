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
  box-sizing: border-box;
  overflow: visible;
  z-index: 10;
`;

interface DraggableElementProps {
  element: PictureElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDragStop: (newLeft: string, newTop: string) => void;
  showPlaceholders?: boolean;
}

export const DraggableElement = ({ element, containerRef, onDragStop, showPlaceholders = true }: DraggableElementProps) => {
  const [{ left, top }, setPosition] = useState(() => {
    return {
      left: element.style.left,
      top: element.style.top
    };
  });
  const elementRef = useRef<HTMLDivElement>(null);

  // Watch for changes in element's style position
  useEffect(() => {
    setPosition({
      left: element.style.left,
      top: element.style.top
    });
  }, [element.style.left, element.style.top]);

  const bind = useDrag(({ xy: [x, y], first, last, event }) => {
    if (!containerRef.current) return;
    event.preventDefault();
    
    if (first) {
      // Store initial position, don't modify it
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const sensitivity = 0.2; // Reduce sensitivity (lower number = less sensitive)

    // Calculate the new position based on the current mouse position and apply HA position correction
    // Calculate raw percentages first
    let newX = ((x - containerRect.left) / containerRect.width) * 100;
    let newY = ((y - containerRect.top) / containerRect.height) * 100;

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
      console.log(`Element ${element.type} - Raw X: ${((x - containerRect.left) / containerRect.width) * 100}%, Final X: ${boundedX}%, Width: ${element.style.width}`);
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
        return (
          <img
            src={element.image}
            alt={element.entity}
            style={{ 
              width: element.style.width || 'auto',
              height: 'auto',
              pointerEvents: 'none', // Prevent image from interfering with drag
              maxWidth: 'none', // Prevent scaling down
              minWidth: element.style.width || 'auto', // Maintain minimum width
              flexShrink: 0 // Prevent flex shrinking
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
