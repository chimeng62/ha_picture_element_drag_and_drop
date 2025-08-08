import { useRef, useState } from 'react';
import styled from 'styled-components';
import type { PictureElement, PictureElementsConfig } from '../types/ha-types';
import { DraggableElement } from './DraggableElement';

const PreviewContainer = styled.div<{ $hasImage: boolean; $isDragOver: boolean }>`
  width: 70%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 2px dashed ${props => props.$isDragOver ? '#2196f3' : '#ccc'};
  background: #f8f8f8;
  transition: border-color 0.3s;

  &::before {
    content: 'Drag and drop an image here';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
    font-size: 1.2em;
    pointer-events: none;
    opacity: ${props => props.$hasImage ? 0 : 1};
  }
`;

const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

interface ImagePreviewProps {
  config: PictureElementsConfig;
  onElementMove: (elementIndex: number, newLeft: string, newTop: string) => void;
  onImageDrop?: (file: File) => void;
  showPlaceholders?: boolean;
  onElementDragStart?: (elementIndex: number) => void;
  onElementDragEnd?: () => void;
  onElementDelete?: (element: PictureElement) => void;
}

export const ImagePreview = ({ config, onElementMove, onImageDrop, showPlaceholders, onElementDragStart, onElementDragEnd, onElementDelete }: ImagePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile && onImageDrop) {
      onImageDrop(imageFile);
    }
  };

  const renderElement = (element: PictureElement, index: number) => {
    if (element.type === 'conditional') {
      return element.elements.map((el, subIndex) => (
        <DraggableElement
          key={`${index}-${subIndex}`}
          element={el}
          containerRef={containerRef}
          onDragStop={(left, top) => onElementMove(index, left, top)}
          onDragStart={() => onElementDragStart?.(index)}
          onDragEnd={onElementDragEnd}
          showPlaceholders={showPlaceholders}
          onDelete={onElementDelete}
        />
      ));
    }

    return (
      <DraggableElement
        key={index}
        element={element}
        containerRef={containerRef}
        onDragStop={(left, top) => onElementMove(index, left, top)}
        onDragStart={() => onElementDragStart?.(index)}
        onDragEnd={onElementDragEnd}
        showPlaceholders={showPlaceholders}
        onDelete={onElementDelete}
      />
    );
  };

  const resolveImagePath = (path: string | undefined): string => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/local/')) {
      return path;
    }
    return path;
  };

  const resolveStateImage = (element: PictureElement): PictureElement => {
    if (element.type === 'image') {
      if (element.state_image) {
        // For humidifiers, default to 'off' state image
        return {
          ...element,
          image: resolveImagePath(element.state_image.off)
        };
      } else if (element.image) {
        return {
          ...element,
          image: resolveImagePath(element.image)
        };
      }
    }
    return element;
  };

  // Check if there's an actual image to display (not just a path for HA)
  const hasActualImage = () => {
    if (!config.image) return false;
    
    // If it's a data URL (uploaded image), it's definitely available
    if (config.image.startsWith('data:')) return true;
    
    // If it's an HTTP URL, consider it available
    if (config.image.startsWith('http')) return true;
    
    // If it's a local path (/local/images/...), check if user actually uploaded something
    // We only consider it "available" if the user has uploaded an actual image
    if (config.image.startsWith('/local/')) {
      const savedImage = localStorage.getItem('ha-picture-image');
      return !!savedImage; // Only show if user has actually uploaded an image
    }
    
    return true;
  };

  return (
    <PreviewContainer 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      $hasImage={hasActualImage()}
      $isDragOver={dragOver}
    >
      {/* Floor plan background image */}
      {hasActualImage() && <BackgroundImage src={resolveImagePath(config.image)} alt="Floor Plan" />}
      {/* Draggable elements (including humidifier images) */}
      {config.elements.map((element, index) => {
        const resolvedElement = resolveStateImage(element);
        return renderElement(resolvedElement, index);
      })}
    </PreviewContainer>
  );
};
