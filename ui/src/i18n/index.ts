import { createI18n } from "vue-i18n";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  INTL_LOCALES,
  LOCALE_LABELS,
  LOCALE_STORAGE_KEY,
  Locale,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "./types";

export * from "./types";

/**
 * Vue I18n instance.
 *
 * `globalInjection` is intentionally left disabled: WUD templates use an
 * explicit `t()` returned from `setup()`, which avoids collisions between
 * `$t` and local variables named `t` (e.g. in `v-slot` scopes).
 */
export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    en,
    "zh-CN": zhCN,
  },
  // Missing keys are reported once per key by vue-i18n; silence in production
  // builds to keep the browser console clean for end users.
  missingWarn: process.env.NODE_ENV !== "production",
  fallbackWarn: process.env.NODE_ENV !== "production",
});

/**
 * Current locale (reactive).
 */
export function currentLocale(): Locale {
  return i18n.global.locale.value as Locale;
}

/**
 * Persist and apply a locale to the whole UI (app, Vuetify, <html lang>).
 *
 * Unknown or unsupported values are ignored and fall back to the default
 * locale, so a corrupted `preferences.locale` can never break the UI.
 *
 * @param locale
 * @returns the locale actually applied
 */
export function setLocale(locale: unknown): Locale {
  const next: Locale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  i18n.global.locale.value = next;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", next);
  }
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Private browsing / storage disabled: the locale still applies for the session.
  }
  return next;
}

/**
 * Read the last locale selected by the user on this browser.
 */
export function getStoredLocale(): Locale | undefined {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Locale used by `Intl.*` formatting (dates, numbers).
 */
export function intlLocale(locale: Locale = currentLocale()): string {
  return INTL_LOCALES[locale] ?? INTL_LOCALES[DEFAULT_LOCALE];
}

/**
 * Options for the language switcher.
 */
export function localeOptions(): Array<{ value: Locale; title: string }> {
  return SUPPORTED_LOCALES.map((value) => ({
    value,
    title: LOCALE_LABELS[value],
  }));
}
