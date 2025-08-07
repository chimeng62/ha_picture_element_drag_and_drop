import { useState } from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  height: 15vh;
  width: 100%;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
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

const SelectGroup = styled.div`
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
}

export const Toolbar = ({ onAddElement, onAddHumidifier }: ToolbarProps) => {
  const [floor, setFloor] = useState('1');
  const [id, setId] = useState('1');

  const handleAddElement = () => {
    onAddElement(floor, id);
  };

  const handleAddHumidifier = () => {
    onAddHumidifier(floor);
  };

  return (
    <ToolbarContainer>
      <SelectGroup>
        <Label>Floor:</Label>
        <Select value={floor} onChange={(e) => setFloor(e.target.value)}>
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

      </SelectGroup>

      <Button onClick={handleAddElement}>
        Add Sensor
      </Button>
      <Button onClick={handleAddHumidifier}>
        Add Humidifier Group
      </Button>
    </ToolbarContainer>
  );
};
