import { load, dump } from 'js-yaml';
import type { PictureElementsConfig, PictureElement, ConditionalElement } from '../types/ha-types';

export const parseYaml = (yamlString: string): PictureElementsConfig => {
  try {
    const parsed = load(yamlString) as PictureElementsConfig;
    return parsed;
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
  isHumidifierGroup = false
): string => {
  const config = parseYaml(yaml);
  const element = config.elements[elementIndex];
  
  if (isHumidifierGroup && element.type === 'conditional') {
    // Update all related humidifier positions
    const targetLeft = newLeft;
    const targetTop = newTop;
    
    // Find all related conditional elements with the same entity
    const humidifierGroups = config.elements.filter(
      (el): el is ConditionalElement => el.type === 'conditional' &&
        el.conditions[0]?.entity === element.conditions[0]?.entity
    );

    // Update all matching positions across all states
    humidifierGroups.forEach(group => {
      const index = group.elements.findIndex(el => 
        el.style.left === element.elements[0].style.left &&
        el.style.top === element.elements[0].style.top
      );
      if (index !== -1) {
        group.elements[index].style.left = targetLeft;
        group.elements[index].style.top = targetTop;
      }
    });
  } else if (element) {
    element.style.left = newLeft;
    element.style.top = newTop;
  }

  return generateYaml(config);
};

export const addHumidifierGroup = (
  yaml: string,
  floor: string,
  positions: Array<{ top: string; left: string; width: string }>
): string => {
  const config = parseYaml(yaml);
  const states = ['on', 'off', 'unavailable'];
  const entity = `switch.switch_humidifier_${floor}f_floor`;

  const createElements = (state: string) => ({
    type: 'conditional' as const,
    conditions: [{ entity, state }],
    elements: positions.map(pos => ({
      type: 'image' as const,
      entity,
      image: `/local/images/gif/${state === 'on' ? 'on_humidifier.gif' : 'off_humidifier.png'}`,
      style: {
        top: pos.top,
        left: pos.left,
        width: pos.width
      }
    }))
  });

  const newElements = states.map(state => createElements(state));
  config.elements = [...newElements, ...config.elements];

  return generateYaml(config);
};
