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
}

const getLocalImagePath = (path: string): string => {
  if (!path) return '';
  // If it's a URL, return as is
  if (path.startsWith('http')) return path;
  // If it's a local path starting with /local/, serve from public directory
  if (path.startsWith('/local/')) return path;
  return path;
};

interface ImagePreviewProps {
  config: PictureElementsConfig;
  onElementMove: (elementIndex: number, newLeft: string, newTop: string) => void;
  onImageDrop?: (file: File) => void;
}

export const ImagePreview = ({ config, onElementMove, onImageDrop }: ImagePreviewProps) => {
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
      return element.elements.map((el, subIndex) => {
        const resolvedElement = el.type === 'image' 
          ? { ...el, image: resolveImagePath(el.image) }
          : el;
        return (
          <DraggableElement
            key={`${index}-${subIndex}`}
            element={resolvedElement}
            containerRef={containerRef}
            onDragStop={(left, top) => onElementMove(index, left, top)}
          />
        );
      });
    }

    return (
      <DraggableElement
        key={index}
        element={element}
        containerRef={containerRef}
        onDragStop={(left, top) => onElementMove(index, left, top)}
      />
    );
  };

  const resolveImagePath = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('data:')) return path; // Keep data URLs as is
    if (path.startsWith('http')) return path; // Keep HTTP URLs as is
    if (path.startsWith('/local/')) {
      return path; // Keep local paths as is for elements
    }
    return path;
  };

  return (
    <PreviewContainer 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      $hasImage={!!config.image}
      $isDragOver={dragOver}
    >
      {/* Floor plan background image */}
      {config.image && <BackgroundImage src={resolveImagePath(config.image)} alt="Floor Plan" />}
      {/* Draggable elements (including humidifier images) */}
      {config.elements.map((element, index) => {
        // Handle both conditional groups and individual elements
        if (element.type === 'conditional') {
          return renderElement(element, index);
        } else if (element.type === 'image') {
          const resolvedImage = resolveImagePath(element.image);
          return (
            <DraggableElement
              key={index}
              element={{
                ...element,
                image: resolvedImage
              }}
              containerRef={containerRef}
              onDragStop={(left, top) => onElementMove(index, left, top)}
            />
          );
        }
        return renderElement(element, index);
      })}
    </PreviewContainer>
  );
};
