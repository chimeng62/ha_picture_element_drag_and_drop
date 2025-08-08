import { useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import type { editor } from 'monaco-editor';

const EditorContainer = styled.div`
  height: 100%;
  width: 30%;
  border-right: 1px solid #ccc;

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

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightLines?: number[]; // Array of line numbers to highlight
  highlightText?: string; // Specific text to highlight
}

export const YamlEditor = ({ value, onChange, highlightLines = [], highlightText }: YamlEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

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
        }}
      />
    </EditorContainer>
  );
};
