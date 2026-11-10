import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  INTL_LOCALES,
  LOCALE_LABELS,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  currentLocale,
  getStoredLocale,
  i18n,
  intlLocale,
  isSupportedLocale,
  localeOptions,
  matchLocale,
  setLocale,
} from '@/i18n';

describe('i18n', () => {
  afterEach(() => {
    localStorage.clear();
    setLocale(DEFAULT_LOCALE);
    jest.restoreAllMocks();
  });

  describe('configuration', () => {
    it('defaults to Simplified Chinese', () => {
      expect(DEFAULT_LOCALE).toBe('zh-CN');
    });

    it('falls back to English for missing keys', () => {
      expect(FALLBACK_LOCALE).toBe('en');
    });

    it('exposes both locales in the switcher, Chinese first', () => {
      expect(SUPPORTED_LOCALES).toEqual(['zh-CN', 'en']);
      expect(localeOptions()).toEqual([
        { value: 'zh-CN', title: LOCALE_LABELS['zh-CN'] },
        { value: 'en', title: LOCALE_LABELS.en },
      ]);
    });

    it('translates to both languages', () => {
      setLocale('zh-CN');
      expect(i18n.global.t('nav.home')).toBe('首页');
      setLocale('en');
      expect(i18n.global.t('nav.home')).toBe('Home');
    });

    it('interpolates named parameters', () => {
      setLocale('zh-CN');
      expect(i18n.global.t('home.containersCount', { count: 3 })).toBe('3 个容器');
      setLocale('en');
      expect(i18n.global.t('home.containersCount', { count: 3 })).toBe('3 containers');
    });

    it('translates Vuetify built-in strings ($vuetify namespace)', () => {
      setLocale('zh-CN');
      expect(i18n.global.t('$vuetify.dataTable.itemsPerPageText')).toBe('每页数目：');
      setLocale('en');
      expect(i18n.global.t('$vuetify.dataTable.itemsPerPageText')).toBe('Rows per page:');
    });
  });

  describe('isSupportedLocale', () => {
    it.each(['zh-CN', 'en'])('accepts %s', (locale) => {
      expect(isSupportedLocale(locale)).toBe(true);
    });

    it.each(['zh', 'fr', 'zh-TW', '', null, undefined, 42, {}])(
      'rejects %p',
      (locale) => {
        expect(isSupportedLocale(locale as unknown)).toBe(false);
      },
    );
  });

  describe('matchLocale', () => {
    it('maps any Chinese variant to zh-CN', () => {
      expect(matchLocale('zh')).toBe('zh-CN');
      expect(matchLocale('zh-CN')).toBe('zh-CN');
      expect(matchLocale('zh-TW')).toBe('zh-CN');
      expect(matchLocale('ZH-HANS-CN')).toBe('zh-CN');
    });

    it('maps English variants to en', () => {
      expect(matchLocale('en')).toBe('en');
      expect(matchLocale('en-US')).toBe('en');
      expect(matchLocale('en_GB')).toBe('en');
    });

    it('returns undefined for unsupported or empty languages', () => {
      expect(matchLocale('fr-FR')).toBe(undefined);
      expect(matchLocale('')).toBe(undefined);
      expect(matchLocale(undefined)).toBe(undefined);
      expect(matchLocale(null)).toBe(undefined);
    });
  });

  describe('setLocale', () => {
    it('applies the locale, the <html lang> attribute and persists it', () => {
      setLocale('en');
      expect(currentLocale()).toBe('en');
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');

      setLocale('zh-CN');
      expect(currentLocale()).toBe('zh-CN');
      expect(document.documentElement.getAttribute('lang')).toBe('zh-CN');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN');
    });

    it('falls back to the default locale for unsupported values', () => {
      expect(setLocale('fr-FR')).toBe('zh-CN');
      expect(currentLocale()).toBe('zh-CN');
      expect(setLocale(undefined)).toBe('zh-CN');
    });

    it('still applies the locale when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });
      expect(() => setLocale('en')).not.toThrow();
      expect(currentLocale()).toBe('en');
    });
  });

  describe('getStoredLocale', () => {
    it('returns a previously stored locale', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
      expect(getStoredLocale()).toBe('en');
    });

    it('ignores unsupported stored values', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'fr-FR');
      expect(getStoredLocale()).toBe(undefined);
    });

    it('returns undefined when nothing is stored', () => {
      localStorage.removeItem(LOCALE_STORAGE_KEY);
      expect(getStoredLocale()).toBe(undefined);
    });

    it('returns undefined when localStorage throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage disabled');
      });
      expect(getStoredLocale()).toBe(undefined);
    });
  });

  describe('intlLocale', () => {
    it('maps UI locales to Intl locale tags', () => {
      expect(intlLocale('zh-CN')).toBe('zh-CN');
      expect(intlLocale('en')).toBe('en-US');
      expect(INTL_LOCALES['zh-CN']).toBe('zh-CN');
    });

    it('defaults to the current UI locale', () => {
      setLocale('en');
      expect(intlLocale()).toBe('en-US');
      setLocale('zh-CN');
      expect(intlLocale()).toBe('zh-CN');
    });
  });
});
