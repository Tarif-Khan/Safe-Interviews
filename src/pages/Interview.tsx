import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CodeEditor from "../CodeEditor";
import Title from "../Title";
import LanguageSelector from "../components/LanguageSelector";

function Interview() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    const electronAPI = (window as any).electronAPI;
    setIsElectron(!!electronAPI);

    if (electronAPI) {
      // Listen for file open events from menu
      electronAPI.onFileOpened((data: { content: string; filePath: string }) => {
        setCode(data.content);
        setCurrentFile(data.filePath);
        
        // Try to detect language from file extension
        const extension = data.filePath.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'py':
            setLanguage('python');
            break;
          case 'java':
            setLanguage('java');
            break;
          case 'cpp':
          case 'cc':
          case 'cxx':
            setLanguage('cpp');
            break;
          case 'c':
            setLanguage('c');
            break;
        }
      });

      // Listen for save requests from menu
      electronAPI.onSaveFileRequest(() => {
        handleSaveFile();
      });

      // Cleanup listeners on unmount
      return () => {
        electronAPI.removeAllListeners('file-opened');
        electronAPI.removeAllListeners('save-file-request');
      };
    }
  }, []);

  const handleOpenFile = async () => {
    if (!isElectron) return;
    
    try {
      const result = await (window as any).electronAPI.openFile();
      if (result) {
        setCode(result.content);
        setCurrentFile(result.filePath);
        
        // Auto-detect language
        const extension = result.filePath.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'py':
            setLanguage('python');
            break;
          case 'java':
            setLanguage('java');
            break;
          case 'cpp':
          case 'cc':
          case 'cxx':
            setLanguage('cpp');
            break;
          case 'c':
            setLanguage('c');
            break;
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleSaveFile = async () => {
    if (!isElectron) return;
    
    try {
      // Suggest filename based on language
      const extensions = {
        python: '.py',
        java: '.java',
        cpp: '.cpp',
        c: '.c'
      };
      
      const defaultPath = currentFile || `untitled${extensions[language as keyof typeof extensions] || '.txt'}`;
      
      const filePath = await (window as any).electronAPI.saveFile(code, defaultPath);
      if (filePath) {
        setCurrentFile(filePath);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const getFileExtensions = (lang: string) => {
    switch (lang) {
      case 'python': return '.py';
      case 'java': return '.java';
      case 'cpp': return '.cpp';
      case 'c': return '.c';
      default: return '.txt';
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="mb-4">
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
        >
          ← Back to Home
        </Link>
      </div>
      
      <Title />
      
      {/* File info and controls */}
      <div className="mb-4 text-center">
        {currentFile && (
          <p className="text-gray-400 mb-2">
            Editing: <span className="text-white">{currentFile.split('/').pop()}</span>
          </p>
        )}
        
        {isElectron && (
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={handleOpenFile}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
            >
              Open File
            </button>
            <button
              onClick={handleSaveFile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Save File
            </button>
          </div>
        )}
      </div>

      <LanguageSelector language={language} setLanguage={setLanguage} />
      
      <div className="mb-4">
        <p className="text-gray-400 text-sm text-center">
          Working in {language.toUpperCase()} • File extension: {getFileExtensions(language)}
        </p>
      </div>
      
      <CodeEditor language={language} code={code} setCode={setCode} />
      
      {!isElectron && (
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            💡 Run as desktop app for file operations and better experience
          </p>
        </div>
      )}
    </div>
  );
}

export default Interview; 