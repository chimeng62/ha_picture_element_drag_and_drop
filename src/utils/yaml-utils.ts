import { load, dump } from 'js-yaml';
import type { PictureElementsConfig, PictureElement, ConditionalElement } from '../types/ha-types';

export const parseYaml = (yamlString: string): PictureElementsConfig => {
  try {
    const parsed = load(yamlString) as PictureElementsConfig;
    // Ensure we always have an elements array
    return {
      ...parsed,
      type: parsed.type || 'picture-elements',
      elements: parsed.elements || []
    };
  } catch (error) {
    console.error('Error parsing YAML:', error);
    throw error;
  }
};

export const generateYaml = (config: PictureElementsConfig): string => {
  try {
    return dump(config);
  } catch (error) {
    console.error('Error generating YAML:', error);
    throw error;
  }
};

export const updateElementPosition = (
  yaml: string,
  elementIndex: number,
  newLeft: string,
  newTop: string,
  currentTop?: string,
  currentLeft?: string
): string => {
  const config = parseYaml(yaml);
  const element = config.elements[elementIndex];
  
  // Check if this is a humidifier (image element with state_image)
  const isHumidifier = element?.type === 'image' && 
                      element.entity?.includes('humidifier') &&
                      element.state_image;
  
  if (isHumidifier) {
    console.log('Analyzing humidifier:', {
      index: elementIndex,
      position: {
        current: {
          top: element.style.top,
          left: element.style.left
        },
        new: {
          top: newTop,
          left: newLeft
        }
      },
      entity: element.entity,
      states: element.state_image ? Object.keys(element.state_image) : []
    });
    
    // Update the position
    if (element && element.style) {
      element.style.left = newLeft;
      element.style.top = newTop;
      console.log('Updated humidifier position');
    }
  } else if (element) {
    // Handle non-humidifier elements
    if (!element.style) {
      element.style = {
        left: newLeft,
        top: newTop
      };
    } else {
      element.style.left = newLeft;
      element.style.top = newTop;
    }
  } else {
    console.error('Invalid element:', element);
    return yaml;
  }

  return generateYaml(config);
};

export const addHumidifierGroup = (
  yaml: string,
  floor: string,
  positions: Array<{ top: string; left: string; width: string }>
): string => {
  const config = parseYaml(yaml);
  const entity = `switch.switch_humidifier_${floor}f_floor`;

  const newElements = positions.map(pos => ({
    type: 'image' as const,
    entity,
    state_image: {
      "on": '/local/images/gif/on_humidifier.gif',
      "off": '/local/images/gif/off_humidifier.png',
      "unavailable": '/local/images/gif/off_humidifier.png'
    },
    style: {
      top: pos.top,
      left: pos.left,
      width: pos.width
    }
  }));

  config.elements = [...newElements, ...config.elements];

  return generateYaml(config);
};
