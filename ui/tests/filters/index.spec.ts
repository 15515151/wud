import { short, dateTime, date, registerGlobalProperties } from '@/filters/index';
import { setLocale } from '@/i18n';

describe('Filters', () => {
  describe('short', () => {
    it('should truncate string to specified length', () => {
      expect(short('abcdefghijk', 5)).toBe('abcde');
    });

    it('should return empty string for null/undefined input', () => {
      expect(short(null, 5)).toBe('');
      expect(short(undefined, 5)).toBe('');
    });

    it('should return original string if shorter than length', () => {
      expect(short('abc', 5)).toBe('abc');
    });
  });

  describe('dateTime', () => {
    it('should format date string according to the current (zh-CN) UI locale', () => {
      setLocale('zh-CN');
      expect(dateTime('2023-01-15T10:30:45Z')).toMatch(/\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/);
    });

    it('should follow the UI locale when it is switched to en', () => {
      setLocale('en');
      expect(dateTime('2023-01-15T10:30:45Z')).toMatch(/\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}/);
    });

    it('should accept an explicit locale', () => {
      expect(dateTime('2023-01-15T10:30:45Z', 'en-US')).toMatch(/\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('date', () => {
    it('should format date string according to the current (zh-CN) UI locale', () => {
      setLocale('zh-CN');
      // 2-digit year on zh-CN (e.g. 23/01/15)
      expect(date('2023-01-15T10:30:45Z')).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    });

    it('should follow the UI locale when it is switched to en', () => {
      setLocale('en');
      expect(date('2023-01-15T10:30:45Z')).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    });

    it('should accept an explicit locale', () => {
      expect(date('2023-01-15T10:30:45Z', 'en-US')).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    });
  });

  describe('registerGlobalProperties', () => {
    it('should register filters as global properties', () => {
      const mockApp = {
        config: {
          globalProperties: {}
        }
      };

      registerGlobalProperties(mockApp);

      expect((mockApp.config.globalProperties as any).$filters).toBeDefined();
      expect((mockApp.config.globalProperties as any).$filters.short).toBe(short);
      expect((mockApp.config.globalProperties as any).$filters.dateTime).toBe(dateTime);
      expect((mockApp.config.globalProperties as any).$filters.date).toBe(date);
    });
  });
});
