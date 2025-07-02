import React from "react";
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  language: string;
  code: string;
  setCode: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, code, setCode }) => {
  // Map language strings to CodeMirror language extensions
  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python':
        return [python()];
      case 'java':
        return [java()];
      case 'cpp':
      case 'c++':
        return [cpp()];
      case 'c':
        return [cpp()]; // C and C++ use the same extension
      default:
        return [];
    }
  };

  return (
    <div className="shadow-lg border border-gray-700 rounded overflow-hidden bg-gray-800" style={{ width: 700, height: 500 }}>
      <CodeMirror
        value={code}
        onChange={(value) => setCode(value)}
        theme={oneDark}
        extensions={getLanguageExtension(language)}
        height="500px"
        width="700px"
        placeholder={`Start coding in ${language}...`}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
          searchKeymap: true,
        }}
        style={{
          fontSize: '16px',
          fontFamily: '"Fira Code", "Monaco", "Consolas", "Ubuntu Mono", monospace',
        }}
      />
    </div>
  );
};

export default CodeEditor; 