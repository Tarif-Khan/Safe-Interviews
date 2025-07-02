import React, { useState } from "react";
import CodeEditor from "../CodeEditor";
import Title from "../Title";
import LanguageSelector from "../components/LanguageSelector";

function Interview() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <Title />
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <CodeEditor language={language} code={code} setCode={setCode} />
    </div>
  );
}

export default Interview; 