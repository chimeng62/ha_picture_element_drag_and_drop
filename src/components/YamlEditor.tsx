import { useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import type { editor } from 'monaco-editor';

const EditorContainer = styled.div`
  height: 100%;
  width: 30%;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;

  /* Custom highlighting styles for Monaco Editor */
  .highlight-line {
    background-color: rgba(255, 255, 0, 0.15) !important;
  }

  .highlight-line-decoration {
    background-color: rgba(255, 255, 0, 0.3) !important;
    width: 3px !important;
  }

  .highlight-text-inline {
    background-color: rgba(255, 165, 0, 0.3) !important;
    border-radius: 2px;
  }
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #555;
`;

const EditorTitle = styled.span`
  color: #f8f8f2;
  font-size: 14px;
  font-weight: 500;
`;

const ResetButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
`;

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightLines?: number[]; // Array of line numbers to highlight
  highlightText?: string; // Specific text to highlight
  onReset?: () => void; // Callback for reset functionality
}

const DEFAULT_YAML = `# Default picture-elements configuration
# Drag your floor plan image and add elements using the toolbar above
type: picture-elements
image: /local/images/floor_plan_1st_floor.png
elements: []`;

export const YamlEditor = ({ value, onChange, highlightLines = [], highlightText, onReset }: YamlEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the YAML to default? This will remove all current elements and cannot be undone.')) {
      if (onReset) {
        onReset();
      } else {
        onChange(DEFAULT_YAML);
      }
    }
  };

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  // Update decorations when highlightLines or highlightText changes
  useEffect(() => {
    if (!editorRef.current) return;

    const decorations: editor.IModelDeltaDecoration[] = [];

    // Add line highlights
    highlightLines.forEach(lineNumber => {
      decorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1000 // Highlight entire line
        },
        options: {
          className: 'highlight-line',
          isWholeLine: true,
          linesDecorationsClassName: 'highlight-line-decoration',
          overviewRuler: {
            color: 'yellow',
            position: 1
          }
        }
      });
    });

    // Add text highlights
    if (highlightText) {
      const model = editorRef.current.getModel();
      if (model) {
        const matches = model.findMatches(
          highlightText, 
          false, // searchOnlyEditableRange
          false, // isRegex
          false, // matchCase
          null,  // wordSeparators
          false  // captureMatches
        );

        matches.forEach(match => {
          decorations.push({
            range: match.range,
            options: {
              className: 'highlight-text',
              inlineClassName: 'highlight-text-inline'
            }
          });
        });
      }
    }

    // Apply decorations
    const decorationIds = editorRef.current.deltaDecorations([], decorations);

    // Cleanup function to remove decorations
    return () => {
      if (editorRef.current) {
        editorRef.current.deltaDecorations(decorationIds, []);
      }
    };
  }, [highlightLines, highlightText]);

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>YAML Configuration</EditorTitle>
        <ResetButton onClick={handleReset}>
          Reset to Default
        </ResetButton>
      </EditorHeader>
      <EditorWrapper>
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 12,
          }}
        />
      </EditorWrapper>
    </EditorContainer>
  );
};
