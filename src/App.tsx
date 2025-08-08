import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { YamlEditor } from './components/YamlEditor';
import { ImagePreview } from './components/ImagePreview';
import { Toolbar } from './components/Toolbar';
import { parseYaml, updateElementPosition, generateYaml, addHumidifierGroup } from './utils/yaml-utils';
import type { PictureElementsConfig, PictureElement } from './types/ha-types';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const defaultYaml = `type: picture-elements
image: /local/images/floor_plan_1st_floor.png
elements: []`;

function App() {
  const [draggedImage, setDraggedImage] = useState<string | null>(() => {
    return localStorage.getItem('ha-picture-image');
  });
  
  const [showPlaceholders, setShowPlaceholders] = useState(() => {
    return localStorage.getItem('ha-show-placeholders') === 'true';
  });

  const [draggingElementIndex, setDraggingElementIndex] = useState<number | null>(null);
  
  const [yamlContent, setYamlContent] = useState(() => {
    const saved = localStorage.getItem('ha-picture-yaml');
    return saved || defaultYaml;
  });

  const [config, setConfig] = useState<PictureElementsConfig>(() => {
    try {
      const saved = localStorage.getItem('ha-picture-yaml');
      const savedImage = localStorage.getItem('ha-picture-image');
      const parsedConfig = parseYaml(saved || defaultYaml);
      return {
        ...parsedConfig,
        image: savedImage || parsedConfig.image,
        elements: parsedConfig.elements || []
      };
    } catch (error) {
      console.error('Error initializing config:', error);
      return {
        type: 'picture-elements',
        image: '/local/images/floor_plan_1st_floor.png',
        elements: []
      };
    }
  });

  const updateConfig = useCallback((yaml: string) => {
    try {
      const parsedConfig = parseYaml(yaml);
      const savedImage = localStorage.getItem('ha-picture-image');
      const newConfig = {
        ...parsedConfig,
        image: savedImage || draggedImage || parsedConfig.image || '/local/images/floor_plan_1st_floor.png',
        elements: Array.isArray(parsedConfig.elements) ? parsedConfig.elements : []
      };
      setConfig(newConfig);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      setConfig({
        type: 'picture-elements',
        image: '/local/images/floor_plan_1st_floor.png',
        elements: []
      });
    }
  }, [draggedImage]);

  const handleYamlChange = useCallback((newYaml: string) => {
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [updateConfig]);

  const handleElementMove = useCallback(
    (elementIndex: number, newLeft: string, newTop: string) => {
      const newYaml = updateElementPosition(yamlContent, elementIndex, newLeft, newTop);
      setYamlContent(newYaml);
      updateConfig(newYaml);
    },
    [yamlContent, updateConfig]
  );

  const handleImageDrop = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setDraggedImage(dataUrl);
      localStorage.setItem('ha-picture-image', dataUrl);
      
      // Update config with the new image
      const newConfig: PictureElementsConfig = {
        ...config,
        image: dataUrl
      };
      
      // Update YAML with just the filename
      const newYaml = yamlContent.replace(
        /^(type: picture-elements\n)(image: .*\n)?/m,
        `type: picture-elements\nimage: /local/images/${file.name}\n`
      );
      
      setConfig(newConfig);
      setYamlContent(newYaml);
      localStorage.setItem('ha-picture-yaml', newYaml);
    };
    reader.readAsDataURL(file);
  }, [config, yamlContent]);

  const getFloorPlanPath = (floor: string): string => {
    const floorText = floor === '1' ? '1st' : 
                      floor === '2' ? '2nd' : 
                      floor === '3' ? '3rd' : 
                      `${floor}th`;
    return `/local/images/floor_plan_${floorText}_floor.png`;
  };

  const handleFloorChange = useCallback((floor: string) => {
    const parsedConfig = parseYaml(yamlContent);
    parsedConfig.image = getFloorPlanPath(floor);
    const newYaml = generateYaml(parsedConfig);
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [yamlContent, updateConfig]);

  const handleAddHumidifier = useCallback((floor: string) => {
    const parsedConfig = parseYaml(yamlContent);
    parsedConfig.elements = parsedConfig.elements || [];

    // Update floor plan image first
    parsedConfig.image = getFloorPlanPath(floor);

    // Create new humidifier element
    const newHumidifier = {
      type: 'image' as const,
      entity: `switch.switch_humidifier_${floor}f_floor`,
      state_image: {
        'on': '/local/images/gif/on_humidifier.gif',
        'off': '/local/images/gif/off_humidifier.png',
        'unavailable': '/local/images/gif/off_humidifier.png'
      },
      style: {
        top: '0%',
        left: '0%',
        width: '15%'
      }
    };

    // Find the last image element index
    const lastImageIndex = [...parsedConfig.elements].reverse()
      .findIndex(el => el.type === 'image');

    if (lastImageIndex === -1) {
      // If no image found, add to the beginning
      parsedConfig.elements.unshift(newHumidifier);
    } else {
      // Insert after the last image
      const insertPosition = parsedConfig.elements.length - lastImageIndex;
      parsedConfig.elements.splice(insertPosition, 0, newHumidifier);
    }

    const newYaml = generateYaml(parsedConfig);
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [yamlContent]);

  const handleAddElement = useCallback((floor: string, id: string) => {
    const tempElement = {
      type: 'state-label' as const,
      entity: `sensor.temp_${floor}f_${id}_temp`,
      prefix: '🌡️',
      style: {
        left: '3%',
        top: '5%',
        color: 'red',
        'font-size': '14px'
      }
    };

    const humidityElement = {
      type: 'state-label' as const,
      entity: `sensor.temp_${floor}f_${id}_humidity`,
      prefix: `${id} 💧`,
      style: {
        left: '1.5%',
        top: '8%',
        color: 'red',
        'font-size': '14px'
      }
    };

    const parsedConfig = parseYaml(yamlContent);
    parsedConfig.elements = parsedConfig.elements || [];

    // Find the last state-label element index
    const lastStateLabelIndex = [...parsedConfig.elements].reverse()
      .findIndex(el => el.type === 'state-label');
    
    if (lastStateLabelIndex === -1) {
      // If no state-label found, add to the end
      parsedConfig.elements.push(tempElement, humidityElement);
    } else {
      // Insert after the last state-label
      const insertPosition = parsedConfig.elements.length - lastStateLabelIndex;
      parsedConfig.elements.splice(insertPosition, 0, tempElement, humidityElement);
    }
    
    const newYaml = generateYaml(parsedConfig);
    
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [yamlContent]);

  const handleTogglePlaceholders = useCallback(() => {
    const newValue = !showPlaceholders;
    setShowPlaceholders(newValue);
    localStorage.setItem('ha-show-placeholders', String(newValue));
  }, [showPlaceholders]);

  const handleDeleteElement = useCallback((elementToDelete: PictureElement) => {
    const parsedConfig = parseYaml(yamlContent);
    
    if (elementToDelete.type === 'state-label' && 'entity' in elementToDelete && elementToDelete.entity.includes('_temp')) {
      // This is a temperature sensor, find and remove the pair
      const tempEntityPattern = elementToDelete.entity.replace('_temp', '');
      
      // Remove both temperature and humidity sensors
      parsedConfig.elements = parsedConfig.elements.filter(el => 
        !(el.type === 'state-label' && 'entity' in el &&
          (el.entity === elementToDelete.entity || el.entity === `${tempEntityPattern}_humidity`))
      );
    } else if (elementToDelete.type === 'state-label' && 'entity' in elementToDelete && elementToDelete.entity.includes('_humidity')) {
      // This is a humidity sensor, find and remove the pair
      const tempEntityPattern = elementToDelete.entity.replace('_humidity', '');
      
      // Remove both temperature and humidity sensors
      parsedConfig.elements = parsedConfig.elements.filter(el => 
        !(el.type === 'state-label' && 'entity' in el &&
          (el.entity === `${tempEntityPattern}_temp` || el.entity === elementToDelete.entity))
      );
    } else {
      // For other elements (like humidifiers), just remove the single element
      parsedConfig.elements = parsedConfig.elements.filter(el => {
        if (el.type !== elementToDelete.type) return true;
        
        // Check if both elements have entity property
        if ('entity' in el && 'entity' in elementToDelete) {
          return el.entity !== elementToDelete.entity;
        }
        
        return true;
      });
    }
    
    const newYaml = generateYaml(parsedConfig);
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [yamlContent, updateConfig]);

  const getHighlightedLines = useCallback(() => {
    if (draggingElementIndex === null) return [];

    // Find the lines in YAML that correspond to the dragging element
    const lines = yamlContent.split('\n');
    const elementLines: number[] = [];
    let elementCount = 0;
    let inElement = false;
    let currentIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Check if this is the start of an element
      if (trimmed.startsWith('- type:')) {
        if (elementCount === draggingElementIndex) {
          inElement = true;
          currentIndent = line.indexOf('-');
          elementLines.push(i + 1); // Monaco uses 1-based line numbers
        } else if (inElement) {
          // We've moved to the next element, stop collecting
          break;
        }
        elementCount++;
      } else if (inElement) {
        // Check if we're still in the same element by indentation
        const lineIndent = line.search(/\S/);
        if (lineIndent > currentIndent) {
          elementLines.push(i + 1);
        } else if (lineIndent === currentIndent && trimmed.startsWith('-')) {
          // New element at same level, stop collecting
          break;
        } else if (lineIndent <= currentIndent && trimmed) {
          // Back to parent level or new section, stop collecting
          break;
        }
      }
    }

    return elementLines;
  }, [yamlContent, draggingElementIndex]);

  return (
    <AppContainer>
      <Toolbar 
        onAddElement={handleAddElement} 
        onAddHumidifier={handleAddHumidifier} 
        onFloorChange={handleFloorChange}
        showPlaceholders={showPlaceholders}
        onTogglePlaceholders={handleTogglePlaceholders}
      />
      <EditorContainer>
        <YamlEditor 
          value={yamlContent} 
          onChange={handleYamlChange}
          highlightLines={getHighlightedLines()}
        />
        <ImagePreview 
          config={config} 
          onElementMove={handleElementMove}
          onImageDrop={handleImageDrop}
          showPlaceholders={showPlaceholders}
          onElementDragStart={setDraggingElementIndex}
          onElementDragEnd={() => setDraggingElementIndex(null)}
          onElementDelete={handleDeleteElement}
        />
      </EditorContainer>
    </AppContainer>
  );
}

export default App;
