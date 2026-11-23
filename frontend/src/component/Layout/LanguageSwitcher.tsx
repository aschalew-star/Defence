import React, { useState, useRef, useEffect, FC } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { LanguageCode, ILanguageInfo } from "../../locales";
import { IoGlobeOutline } from "react-icons/io5";

export interface LanguageSwitcherProps {
  variant?: "compact" | "menu" | "pill";
  className?: string;
}

const LanguageSwitcher: FC<LanguageSwitcherProps> = ({
  variant = "compact",
  className = "",
}) => {
  const { language, setLanguage, currentLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Variant: Menu (for mobile drawer or settings panels)
  if (variant === "menu") {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
          <IoGlobeOutline className="text-amber-700 text-sm" />
          <span>Language / ቋንቋ / Afaan</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang: ILanguageInfo) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  isSelected
                    ? "bg-amber-800 text-white border-amber-800 shadow-sm"
                    : "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:bg-amber-50/50"
                }`}
              >
                <span className="text-sm shrink-0">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variant: Compact Dropdown (for Top Banner or Header bar)
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-0.5 rounded-full bg-amber-900/90 hover:bg-amber-800 text-amber-100 text-[11px] font-bold border border-amber-600/60 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Switch Language / ቋንቋ ይቀይሩ / Afaan jijjiiri"
      >
        <span className="text-xs">{currentLanguage.flag}</span>
        <span className="tracking-wide">{currentLanguage.nativeName}</span>
        <span className="text-[9px] text-amber-300 ml-0.5">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1 border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Select Language
          </div>
          {languages.map((lang: ILanguageInfo) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition ${
                  isSelected
                    ? "bg-amber-50 text-amber-900 font-bold"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && (
                  <span className="text-amber-700 text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
