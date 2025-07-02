import React from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  code: string;
  setCode: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, code, setCode }) => {
  return (
    <div className="shadow-lg border border-gray-700 rounded overflow-hidden bg-gray-800" style={{ width: 700, height: 500 }}>
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeEditor; 