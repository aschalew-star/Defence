import { LanguageCode, ILanguageInfo, TranslationSchema } from "./types";
import { en } from "./en";
import { am } from "./am";
import { om } from "./om";
import { ti } from "./ti";

export * from "./types";
export { en, am, om, ti };

export const SUPPORTED_LANGUAGES: ILanguageInfo[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English (US)",
    flag: "🇺🇸",
    dir: "ltr",
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    flag: "🇪🇹",
    dir: "ltr",
  },
  {
    code: "om",
    name: "Afaan Oromoo",
    nativeName: "Afaan Oromoo",
    flag: "🇪🇹",
    dir: "ltr",
  },
  {
    code: "ti",
    name: "Tigrigna",
    nativeName: "ትግርኛ",
    flag: "🇪🇹",
    dir: "ltr",
  },
];

export const DICTIONARIES: Record<LanguageCode, TranslationSchema> = {
  en,
  am,
  om,
  ti,
};

export const getLanguageInfo = (code: LanguageCode): ILanguageInfo => {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
};

/**
 * Resolves a dot-notated key path (e.g. "header.orders" or "auth.signInTitle")
 * with automatic fallback to English and template parameter interpolation.
 */
export const translate = (
  lang: LanguageCode,
  keyPath: string,
  fallback?: string,
  params?: Record<string, string | number>
): string => {
  const parts = keyPath.split(".");
  const currentDict = DICTIONARIES[lang] || DICTIONARIES.en;
  const englishDict = DICTIONARIES.en;

  let resolvedValue: any = currentDict;
  for (const part of parts) {
    if (resolvedValue && typeof resolvedValue === "object" && part in resolvedValue) {
      resolvedValue = resolvedValue[part];
    } else {
      resolvedValue = undefined;
      break;
    }
  }

  // Fallback to English if missing in current language
  if (resolvedValue === undefined && lang !== "en") {
    let fallbackSearch: any = englishDict;
    for (const part of parts) {
      if (fallbackSearch && typeof fallbackSearch === "object" && part in fallbackSearch) {
        fallbackSearch = fallbackSearch[part];
      } else {
        fallbackSearch = undefined;
        break;
      }
    }
    resolvedValue = fallbackSearch;
  }

  // If still not found, return explicit fallback or keyPath
  let text = typeof resolvedValue === "string" ? resolvedValue : fallback || keyPath;

  // Interpolate parameters, e.g. {count}
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
    });
  }

  return text;
};
