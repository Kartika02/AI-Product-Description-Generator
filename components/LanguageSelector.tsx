import React from 'react';
import { LanguageIcon } from './Icons';
import type { Language } from '../i18n';

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-gray-700 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        aria-label="Select language"
      >
        <option value="id">Bahasa Indonesia</option>
        <option value="en">English</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <LanguageIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};
