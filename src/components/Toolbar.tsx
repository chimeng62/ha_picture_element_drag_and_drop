import { useState } from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 15vh;
  width: 100%;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
`;

const QuickGuide = styled.div`
  margin-top: 6px;
  padding: 8px;
  background-color: #e8f4fd;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  font-size: 12px;
  color: #333;
  max-width: 300px;
`;

const GuideStep = styled.div`
  margin: 2px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StepNumber = styled.span`
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
`;

const ButtonWithPreview = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewBox = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  white-space: pre;
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #555;
  display: none;

  ${ButtonWithPreview}:hover & {
    display: block;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 8px;
`;

const Box = styled.div`
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
`;

const BoxTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
`;

interface ToolbarProps {
  onAddElement: (floor: string, id: string) => void;
  onAddHumidifier: (floor: string) => void;
  onFloorChange?: (floor: string) => void;
  showPlaceholders?: boolean;
  onTogglePlaceholders?: () => void;
}

export const Toolbar = ({ onAddElement, onAddHumidifier, onFloorChange, showPlaceholders, onTogglePlaceholders }: ToolbarProps) => {
  const [floor, setFloor] = useState('1');
  const [id, setId] = useState('1');

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFloor = e.target.value;
    setFloor(newFloor);
    onFloorChange?.(newFloor);
  };

  const handleAddElement = () => {
    onAddElement(floor, id);
  };

  const handleAddHumidifier = () => {
    onAddHumidifier(floor);
  };

  const getTempSensorPreview = () => {
    return `# Temperature Sensor YAML
- type: state-label
  entity: sensor.temp_${floor}f_${id}_temp
  prefix: '🌡️'
  style:
    left: '3%'
    top: '5%'
    color: 'red'
    font-size: '14px'
- type: state-label
  entity: sensor.temp_${floor}f_${id}_humidity
  prefix: '${id} 💧'
  style:
    left: '1.5%'
    top: '8%'
    color: 'red'
    font-size: '14px'`;
  };

  const getHumidifierPreview = () => {
    return `# Humidifier YAML
- type: image
  entity: switch.switch_humidifier_${floor}f_floor
  state_image:
    'on': '/local/images/gif/on_humidifier.gif'
    'off': '/local/images/gif/off_humidifier.png'
    'unavailable': '/local/images/gif/off_humidifier.png'
  style:
    top: '0%'
    left: '0%'
    width: '15%'`;
  };

  return (
    <ToolbarContainer>
      <LeftSection>
        <Box>
          <BoxTitle>Add Temperature Sensor</BoxTitle>
          <SelectGroup>
            <Controls>
              <Label>Floor:</Label>
              <Select value={floor} onChange={handleFloorChange}>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </Select>

              <Label>ID:</Label>
              <Select value={id} onChange={(e) => setId(e.target.value)}>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </Select>
            </Controls>
            <ButtonWithPreview>
              <Button onClick={handleAddElement}>
                Add Sensor
              </Button>
              <PreviewBox>
                {getTempSensorPreview()}
              </PreviewBox>
            </ButtonWithPreview>
          </SelectGroup>
        </Box>

        <Box>
          <BoxTitle>Add Humidifier</BoxTitle>
          <SelectGroup>
            <Controls>
              <Label>Floor:</Label>
              <Select value={floor} onChange={handleFloorChange}>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </Select>
            </Controls>
            <ButtonWithPreview>
              <Button onClick={handleAddHumidifier}>
                Add Humidifier
              </Button>
              <PreviewBox>
                {getHumidifierPreview()}
              </PreviewBox>
            </ButtonWithPreview>
          </SelectGroup>
        </Box>

        <Box>
          <BoxTitle>Display Options</BoxTitle>
          <SelectGroup>
            <Button onClick={onTogglePlaceholders}>
              {showPlaceholders ? 'Show Entity Names' : 'Show Placeholder Values'}
            </Button>
          </SelectGroup>
        </Box>
      </LeftSection>

      <RightSection>
        <div>
          <Title>Home Assistant picture-elements drag&drop</Title>
          <QuickGuide>
            <GuideStep>
              <StepNumber>1</StepNumber>
              <span>Drag floor plan image into preview area</span>
            </GuideStep>
            <GuideStep>
              <StepNumber>2</StepNumber>
              <span>Add temperature sensors or humidifiers</span>
            </GuideStep>
            <GuideStep>
              <StepNumber>3</StepNumber>
              <span>Drag elements to desired positions</span>
            </GuideStep>
            <GuideStep>
              <StepNumber>4</StepNumber>
              <span>Copy YAML to Home Assistant</span>
            </GuideStep>
          </QuickGuide>
        </div>
      </RightSection>
    </ToolbarContainer>
  );
};
