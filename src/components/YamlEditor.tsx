import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  height: 100%;
  width: 30%;
  border-right: 1px solid #ccc;
`;

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const YamlEditor = ({ value, onChange }: YamlEditorProps) => {
  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <EditorContainer>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
        }}
      />
    </EditorContainer>
  );
};
