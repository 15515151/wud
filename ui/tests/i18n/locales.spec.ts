import en from '@/i18n/locales/en';
import zhCN from '@/i18n/locales/zh-CN';

type Messages = Record<string, unknown>;

/**
 * Flatten a nested messages object into `a.b.c` keys with leaf string values.
 */
function flatten(messages: Messages, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[path] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(out, flatten(value as Messages, path));
    } else {
      out[path] = String(value);
    }
  }
  return out;
}

/**
 * Extract named interpolation placeholders (`{name}`, `{count}`, ...).
 */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

const enFlat = flatten(en as unknown as Messages);
const zhFlat = flatten(zhCN as unknown as Messages);

describe('locales', () => {
  it('provides at least the core UI translations', () => {
    expect(Object.keys(enFlat).length).toBeGreaterThan(300);
  });

  it('zh-CN defines exactly the same keys as en', () => {
    const missing = Object.keys(enFlat).filter((key) => !(key in zhFlat));
    const extra = Object.keys(zhFlat).filter((key) => !(key in enFlat));
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });

  it('never contains empty translations', () => {
    for (const [key, value] of Object.entries(zhFlat)) {
      expect([key, value.trim().length]).toEqual([key, expect.any(Number)]);
      expect(value.trim()).not.toBe('');
    }
  });

  it('keeps the same interpolation placeholders in both languages', () => {
    for (const key of Object.keys(enFlat)) {
      expect([key, placeholders(zhFlat[key])]).toEqual([key, placeholders(enFlat[key])]);
    }
  });

  it('actually translates the Chinese messages (no english leftovers)', () => {
    // Keys whose value is expected to stay in English in zh-CN: technical
    // terms, product names and brand strings.
    const ALLOWED_ENGLISH = new Set([
      'login.title', // "What's Up Docker?" product name
      'profile.tokensHintAuth', // "Authorization: Bearer wud_..."
      // Docker / registry technical terms kept as-is by convention.
      'image.digest',
      'update.digest',
      'status.digest',
      'status.tag',
    ]);
    const leftovers = Object.entries(zhFlat)
      .filter(([key]) => !ALLOWED_ENGLISH.has(key))
      .filter(([, value]) => /^[A-Za-z][A-Za-z ,.'()\-/:!?…]*$/.test(value))
      // Single technical words / codes are fine (Docker, OIDC, semver, ...).
      .filter(([, value]) => value.split(/\s+/).length > 1 || /^(Docker|OIDC|digest|tag)$/i.test(value))
      .map(([key, value]) => `${key}: ${value}`);
    expect(leftovers).toEqual([]);
  });

  it('keeps technical terms untranslated in Chinese', () => {
    const catalog = JSON.stringify(zhCN);
    for (const term of ['Docker', 'WUD', 'OIDC', 'Semver', 'SSE', 'API']) {
      expect(catalog).toContain(term);
    }
    // Terms that must NOT be translated away.
    expect(zhFlat['containers.officialImage']).toContain('Docker');
    expect(zhFlat['logs.liveStream']).toContain('SSE');
    expect(zhFlat['users.oidcNote']).toContain('OIDC');
    expect(zhFlat['testTrigger.updateSemverDiff']).toContain('Semver');
    expect(zhFlat['containers.headers.stack']).toContain('Stack');
  });

  it('provides Vuetify built-in strings for both locales', () => {
    expect(zhFlat['$vuetify.dataTable.itemsPerPageText']).toBeDefined();
    expect(zhFlat['$vuetify.noDataText']).toBeDefined();
    expect(enFlat['$vuetify.dataTable.itemsPerPageText']).toBeDefined();
    expect(enFlat['$vuetify.noDataText']).toBeDefined();
  });
});

describe('locale usage in components', () => {
  // Guard against typos such as `nav.authentications` which silently render
  // as the raw key at runtime.
  const fs = require('fs');
  const path = require('path');

  function listVueFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry: any) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listVueFiles(full);
      }
      return entry.name.endsWith('.vue') ? [full] : [];
    });
  }

  it('every statically referenced translation key exists', () => {
    const files = [
      ...listVueFiles(path.join(__dirname, '..', '..', 'src', 'components')),
      ...listVueFiles(path.join(__dirname, '..', '..', 'src', 'views')),
      path.join(__dirname, '..', '..', 'src', 'App.vue'),
    ];
    const used = new Set<string>();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const m of content.matchAll(/\b(?:this\.|vm\.)?t\(\s*['"]([\w.$]+)['"]/g)) {
        used.add(m[1]);
      }
      for (const m of content.matchAll(/(?:labelKey|titleKey):\s*['"]([\w.$]+)['"]/g)) {
        used.add(m[1]);
      }
    }
    expect(used.size).toBeGreaterThan(100);
    expect([...used].filter((key) => !(key in enFlat))).toEqual([]);
  });
});
