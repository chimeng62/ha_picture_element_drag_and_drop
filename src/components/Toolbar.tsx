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

  return (
    <ToolbarContainer>
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
          <Button onClick={handleAddElement}>
            Add Sensor
          </Button>
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
          <Button onClick={handleAddHumidifier}>
            Add Humidifier
          </Button>
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
    </ToolbarContainer>
  );
};
