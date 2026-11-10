import { DEFAULT_LOCALE, Locale, getStoredLocale } from "./index";
import { matchLocale } from "./types";

/**
 * Detect the locale to use at application start.
 *
 * Priority:
 * 1. the locale previously chosen by the user on this browser,
 * 2. the browser language (`navigator.languages`, most preferred first),
 * 3. {@link DEFAULT_LOCALE}.
 */
export function detectLocale(): Locale {
  const stored = getStoredLocale();
  if (stored) {
    return stored;
  }

  if (typeof navigator !== "undefined") {
    const languages: readonly string[] =
      (navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language]) || [];
    for (const language of languages) {
      const matched = matchLocale(language);
      if (matched) {
        return matched;
      }
    }
  }

  return DEFAULT_LOCALE;
}
