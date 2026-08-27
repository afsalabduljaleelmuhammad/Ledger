import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./i18n";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("kp_lang") || null);

  useEffect(() => {
    if (lang) localStorage.setItem("kp_lang", lang);
  }, [lang]);

  const t = translations[lang] || translations.en;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
