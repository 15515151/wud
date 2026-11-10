import { currentLocale, intlLocale } from "@/i18n";

/**
 * Truncate an id to x chars.
 * @param fullId
 * @param length
 * @returns {string}
 */
function short(fullId, length) {
  if (!fullId) {
    return "";
  }
  return fullId.substring(0, length);
}

/**
 * Resolve the BCP 47 tag used for date formatting.
 *
 * When no explicit locale is given, the current UI locale is used so dates
 * follow the language selected in the UI (e.g. `2025/01/15` in Simplified
 * Chinese, `01/15/2025` in English).
 *
 * @param locale
 */
function resolveIntlLocale(locale?: string): string {
  return locale || intlLocale(currentLocale());
}

/**
 * Formate a dateTime for display.
 * @param dateStr
 * @param locale optional BCP 47 locale (defaults to the current UI locale)
 * @returns {string}
 */
function dateTime(dateStr, locale?: string) {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), options).format(date);
}

/**
 * Formate a date for display.
 * @param dateStr
 * @param locale optional BCP 47 locale (defaults to the current UI locale)
 * @returns {string}
 */
function date(dateStr, locale?: string) {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), options).format(date);
}

/**
 * Register all global properties (replacing filters).
 */
function registerGlobalProperties(app) {
  app.config.globalProperties.$filters = {
    short,
    dateTime,
    date,
  };
}

export { registerGlobalProperties, short, dateTime, date };
