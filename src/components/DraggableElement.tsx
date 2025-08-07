import { useState, useRef, useEffect } from 'react';
import type { PictureElement } from '../types/ha-types';
import { useDrag } from '@use-gesture/react';
import styled from 'styled-components';

const ElementContainer = styled.div<{ $left: string; $top: string }>`
  position: absolute;
  cursor: move;
  user-select: none;
  display: inline-block;
  left: ${props => props.$left};
  top: ${props => props.$top};
  touch-action: none;
`;

interface DraggableElementProps {
  element: PictureElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDragStop: (newLeft: string, newTop: string) => void;
}

export const DraggableElement = ({ element, containerRef, onDragStop }: DraggableElementProps) => {
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
    const newX = ((x - containerRect.left) / containerRect.width) * 100 * (60/56); // Apply correction factor to match HA rendering
    const newY = ((y - containerRect.top) / containerRect.height) * 100;

    // Round to reduce jitter and apply bounds with fixed decimal precision
    const boundedX = Math.max(0, Math.min(100, Number((Math.round(newX / sensitivity) * sensitivity).toFixed(1))));
    const boundedY = Math.max(0, Math.min(100, Number((Math.round(newY / sensitivity) * sensitivity).toFixed(1))));

    const newLeft = `${boundedX}%`;
    const newTop = `${boundedY}%`;

    setPosition({ left: newLeft, top: newTop });
    
    if (last) {
      onDragStop(newLeft, newTop);
    }
  }, {
    threshold: 5, // Add a small threshold to prevent accidental drags
  });

  const renderContent = () => {
    switch (element.type) {
      case 'state-label':
        const fontSize = element.style['font-size']?.replace(/(\d+)px/, (_, size) => `${Number(size) * 1.4}px`);
        return (
          <span style={{ color: element.style.color, fontSize }}>
            {element.prefix || ''} {element.entity}
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
              pointerEvents: 'none' // Prevent image from interfering with drag
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
