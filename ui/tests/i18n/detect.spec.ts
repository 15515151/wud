import { DEFAULT_LOCALE, Locale } from '@/i18n/types';
import { detectLocale } from '@/i18n/detect';
import { LOCALE_STORAGE_KEY } from '@/i18n/types';

/**
 * Replace `navigator.languages` / `navigator.language` for one test.
 */
function mockBrowserLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', {
    value: languages,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'language', {
    value: languages[0],
    configurable: true,
  });
}

describe('detectLocale', () => {
  const originalLanguages = window.navigator.languages;
  const originalLanguage = window.navigator.language;

  afterEach(() => {
    localStorage.clear();
    Object.defineProperty(window.navigator, 'languages', {
      value: originalLanguages,
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
  });

  it('prefers the locale previously chosen by the user', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    mockBrowserLanguages(['zh-CN']);
    expect(detectLocale()).toBe<Locale>('en');
  });

  it('uses the browser Chinese language', () => {
    mockBrowserLanguages(['zh-CN', 'en-US']);
    expect(detectLocale()).toBe<Locale>('zh-CN');
  });

  it('maps other Chinese variants to zh-CN', () => {
    mockBrowserLanguages(['zh-TW']);
    expect(detectLocale()).toBe<Locale>('zh-CN');
  });

  it('uses the browser English language', () => {
    mockBrowserLanguages(['en-GB']);
    expect(detectLocale()).toBe<Locale>('en');
  });

  it('falls back to the first supported language in the preference list', () => {
    mockBrowserLanguages(['fr-FR', 'de-DE', 'en-US']);
    expect(detectLocale()).toBe<Locale>('en');
  });

  it('defaults to Simplified Chinese for unsupported languages', () => {
    mockBrowserLanguages(['fr-FR']);
    expect(detectLocale()).toBe(DEFAULT_LOCALE);
    expect(detectLocale()).toBe<Locale>('zh-CN');
  });

  it('ignores an unsupported stored locale', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'ja-JP');
    mockBrowserLanguages(['en-US']);
    expect(detectLocale()).toBe<Locale>('en');
  });

  it('keeps working when navigator exposes no languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      value: [],
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
    expect(detectLocale()).toBe<Locale>('en');
  });
});
