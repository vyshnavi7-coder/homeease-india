import React, { createContext, useContext, useState, useEffect } from "react";
import { OFFICIAL_LANGUAGES, translations, Language } from "../locales/languages";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguageCode: (code: string) => void;
  t: (key: string, defaultText?: string) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCode] = useState<string>(() => {
    return localStorage.getItem("homeease_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("homeease_lang", langCode);
  }, [langCode]);

  const currentLanguage =
    OFFICIAL_LANGUAGES.find((l) => l.code === langCode) || OFFICIAL_LANGUAGES[0];

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[langCode];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageCode: setLangCode,
        t,
        languages: OFFICIAL_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
