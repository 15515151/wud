/**
 * Shared locale types.
 *
 * The English locale is the source of truth for translation *keys*. Other
 * locales must define exactly the same nested key structure, but with values
 * of their own language (so they cannot be typed with the literal English
 * strings). The tests in `tests/i18n/locales.spec.ts` additionally enforce the
 * same key set and the same interpolation placeholders at runtime.
 */

/**
 * Recursively map a messages object to the same key structure with free-form
 * string values.
 */
export type MessageSchema<T> = {
  [K in keyof T]: T[K] extends string ? string : MessageSchema<T[K]>;
};

/**
 * Supported UI locales.
 *
 * `en` is the source of truth for translation keys (see `./locales/en.ts`),
 * `zh-CN` is the Simplified Chinese translation.
 */
export type Locale = "en" | "zh-CN";

/**
 * Default locale used when no user preference and no supported browser
 * language can be detected.
 */
export const DEFAULT_LOCALE: Locale = "zh-CN";

/**
 * Fallback locale used by vue-i18n when a key is missing.
 */
export const FALLBACK_LOCALE: Locale = "en";

/**
 * All locales supported by the UI, in display order.
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ["zh-CN", "en"];

/**
 * Human readable labels for the language switcher. Each language is always
 * displayed in its own script, whatever the current UI language is.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "简体中文",
  en: "English",
};

/**
 * BCP 47 tags used for `Intl.*` formatting (dates, numbers).
 */
export const INTL_LOCALES: Record<Locale, string> = {
  "zh-CN": "zh-CN",
  en: "en-US",
};

/**
 * localStorage key holding the last selected locale (available before the
 * user is authenticated and before the profile is loaded).
 */
export const LOCALE_STORAGE_KEY = "wudLocale";

/**
 * Check whether a value is a supported locale.
 * @param value
 */
export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Map a browser language tag (e.g. `zh-CN`, `zh-TW`, `fr-FR`) to a supported
 * locale, or `undefined` when nothing matches.
 * @param language
 */
export function matchLocale(
  language: string | undefined | null,
): Locale | undefined {
  if (!language) {
    return undefined;
  }
  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (normalized.startsWith("zh")) {
    return "zh-CN";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  return undefined;
}
