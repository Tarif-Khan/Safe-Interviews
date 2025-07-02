import React from "react";

const languages = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C", value: "c" },
];

interface LanguageSelectorProps {
  language: string;
  setLanguage: (language: string) => void;
}

function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-center">
      <label className="mr-2 font-medium text-white">Language:</label>
      <select
        className="border rounded px-2 py-1 bg-gray-800 text-white"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector; 