import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { YamlEditor } from './components/YamlEditor';
import { ImagePreview } from './components/ImagePreview';
import { Toolbar } from './components/Toolbar';
import { parseYaml, updateElementPosition, generateYaml, addHumidifierGroup } from './utils/yaml-utils';
import type { PictureElementsConfig } from './types/ha-types';

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
elements:
  - type: state-label
    entity: sensor.temp_1f_1_temp
    prefix: 🌡️
    style:
      left: 42.4%
      top: 42.4%
      color: red
      font-size: 14px
  - type: state-label
    entity: sensor.temp_1f_1_humidity
    prefix: 1 💧
    style:
      left: 32.6%
      top: 46.2%
      color: red
      font-size: 14px
  - type: state-label
    entity: sensor.temp_1f_2_temp
    prefix: 🌡️
    style:
      left: 65.4%
      top: 47.2%
      color: red
      font-size: 14px
  - type: state-label
    entity: sensor.temp_1f_2_humidity
    prefix: 2 💧
    style:
      left: 64.4%
      top: 50%
      color: red
      font-size: 14px`;

function App() {
  const [draggedImage, setDraggedImage] = useState<string | null>(() => {
    return localStorage.getItem('ha-picture-image');
  });
  
  const [yamlContent, setYamlContent] = useState(() => {
    const saved = localStorage.getItem('ha-picture-yaml');
    return saved || defaultYaml;
  });

  const [config, setConfig] = useState<PictureElementsConfig>(() => {
    const saved = localStorage.getItem('ha-picture-yaml');
    const savedImage = localStorage.getItem('ha-picture-image');
    const parsedConfig = parseYaml(saved || defaultYaml);
    if (savedImage) {
      parsedConfig.image = savedImage;
    }
    return parsedConfig;
  });

  const updateConfig = useCallback((yaml: string) => {
    try {
      const parsedConfig = parseYaml(yaml);
      const savedImage = localStorage.getItem('ha-picture-image');
      const newConfig = {
        ...parsedConfig,
        image: savedImage || draggedImage || parsedConfig.image,
        elements: parsedConfig.elements || []
      };
      setConfig(newConfig);
    } catch (error) {
      console.error('Error parsing YAML:', error);
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

  const handleAddHumidifier = useCallback((floor: string) => {
    const defaultPositions = [
      { top: '24%', left: '82%', width: '15%' },
      { top: '49%', left: '63%', width: '15%' },
      { top: '68%', left: '65%', width: '15%' }
    ];

    const newYaml = addHumidifierGroup(yamlContent, floor, defaultPositions);
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
        left: '60%',
        top: '80%',
        color: 'red',
        'font-size': '14px'
      }
    };

    const humidityElement = {
      type: 'state-label' as const,
      entity: `sensor.temp_${floor}f_${id}_humidity`,
      prefix: `${id} 💧`,
      style: {
        left: '54.8%',
        top: '83%',
        color: 'red',
        'font-size': '14px'
      }
    };

    const parsedConfig = parseYaml(yamlContent);
    parsedConfig.elements = parsedConfig.elements || [];

    // Add new elements to the beginning of the array, right after elements: tag
    const newElements = [tempElement, humidityElement, ...parsedConfig.elements];
    parsedConfig.elements = newElements;
    
    const newConfig = {
      ...parsedConfig,
      elements: newElements
    };
    const newYaml = generateYaml(newConfig);
    
    setYamlContent(newYaml);
    localStorage.setItem('ha-picture-yaml', newYaml);
    updateConfig(newYaml);
  }, [yamlContent]);

  return (
    <AppContainer>
      <Toolbar onAddElement={handleAddElement} onAddHumidifier={handleAddHumidifier} />
      <EditorContainer>
        <YamlEditor value={yamlContent} onChange={handleYamlChange} />
        <ImagePreview 
          config={config} 
          onElementMove={handleElementMove}
          onImageDrop={handleImageDrop}
        />
      </EditorContainer>
    </AppContainer>
  );
}

export default App;
