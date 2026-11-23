import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  FC,
  ReactNode,
} from "react";
import {
  LanguageCode,
  ILanguageInfo,
  SUPPORTED_LANGUAGES,
  getLanguageInfo,
  translate,
} from "../locales";
import axios from "axios";
import { server } from "../server";

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguage: ILanguageInfo;
  languages: ILanguageInfo[];
  t: (
    keyPath: string,
    fallback?: string,
    params?: Record<string, string | number>
  ) => string;
}

const STORAGE_KEY = "mep_language";

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  currentLanguage: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
  t: (_key, fallback) => fallback || _key,
});

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode;
      if (stored && ["en", "am", "om", "ti"].includes(stored)) {
        return stored;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return "en";
  });

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (!["en", "am", "om", "ti"].includes(newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(
        new CustomEvent("languageChange", { detail: newLang })
      );
    } catch (e) {
      // Ignore storage errors
    }

    // Proactively persist to user profile if authenticated
    try {
      axios
        .put(
          `${server}/user/update-user-info`,
          { shoppingPreferences: { preferredLanguage: newLang } },
          { withCredentials: true }
        )
        .catch(() => {});
    } catch (e) {
      // Ignore background sync errors
    }
  }, []);

  // Sync state if another tab or component dispatches languageChange
  useEffect(() => {
    const handleStorageChange = (e: any) => {
      if (e.detail && ["en", "am", "om", "ti"].includes(e.detail)) {
        setLanguageState(e.detail);
      }
    };
    window.addEventListener("languageChange", handleStorageChange);
    document.documentElement.lang = language;
    return () => {
      window.removeEventListener("languageChange", handleStorageChange);
    };
  }, [language]);

  const currentLanguage = useMemo(
    () => getLanguageInfo(language),
    [language]
  );

  const t = useCallback(
    (
      keyPath: string,
      fallback?: string,
      params?: Record<string, string | number>
    ) => {
      return translate(language, keyPath, fallback, params);
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      currentLanguage,
      languages: SUPPORTED_LANGUAGES,
      t,
    }),
    [language, setLanguage, currentLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};

export default LanguageContext;
