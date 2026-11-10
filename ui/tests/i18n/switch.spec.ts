import { mount } from '@vue/test-utils';
import NavigationDrawer from '@/components/NavigationDrawer.vue';
import ProfileView from '@/views/ProfileView.vue';
import { currentLocale, setLocale } from '@/i18n';
import { updatePreferences, getProfile, listTokens } from '@/services/profile';

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ name: 'home' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@/services/auth', () => ({
  logout: jest.fn(() => Promise.resolve({})),
  getUser: jest.fn(() => Promise.resolve({ id: 'u1', username: 'testuser', role: 'admin' })),
}));

jest.mock('@/services/app', () => ({
  getAppInfos: jest.fn(() => Promise.resolve({ version: '1.2.3' })),
}));

jest.mock('@/services/profile', () => ({
  getProfile: jest.fn(),
  updatePreferences: jest.fn(() => Promise.resolve({})),
  updatePassword: jest.fn(),
  listTokens: jest.fn(() => Promise.resolve([])),
  createToken: jest.fn(),
  deleteToken: jest.fn(),
}));

const mockUser = {
  username: 'testuser',
  role: 'admin',
};

function mountWithBus(component: any, props: Record<string, unknown> = {}) {
  return mount(component, {
    props,
    global: {
      provide: {
        eventBus: { emit: jest.fn() },
      },
    },
  });
}

describe('language switching', () => {
  let wrapper: any;

  beforeEach(() => {
    setLocale('zh-CN');
    (updatePreferences as jest.Mock).mockClear();
    (updatePreferences as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    setLocale('zh-CN');
  });

  describe('NavigationDrawer', () => {
    it('exposes both languages and the current one', () => {
      wrapper = mountWithBus(NavigationDrawer, { user: mockUser });
      expect(wrapper.vm.languages).toEqual([
        { value: 'zh-CN', title: '简体中文' },
        { value: 'en', title: 'English' },
      ]);
      expect(wrapper.vm.currentLanguage).toBe('zh-CN');
    });

    it('switches the UI language and persists the preference', async () => {
      wrapper = mountWithBus(NavigationDrawer, { user: mockUser });
      await wrapper.vm.changeLanguage('en');

      expect(currentLocale()).toBe('en');
      expect(updatePreferences).toHaveBeenCalledWith({ locale: 'en' });
      expect(wrapper.text()).toContain('Containers');
    });

    it('ignores a switch to the language already active', async () => {
      wrapper = mountWithBus(NavigationDrawer, { user: mockUser });
      await wrapper.vm.changeLanguage('zh-CN');
      expect(updatePreferences).not.toHaveBeenCalled();
    });

    it('does not call the API when no user is authenticated', async () => {
      wrapper = mountWithBus(NavigationDrawer, {});
      await wrapper.vm.changeLanguage('en');
      expect(currentLocale()).toBe('en');
      expect(updatePreferences).not.toHaveBeenCalled();
    });

    it('keeps the language applied even if persisting fails', async () => {
      (updatePreferences as jest.Mock).mockRejectedValueOnce(new Error('offline'));
      wrapper = mountWithBus(NavigationDrawer, { user: mockUser });
      await wrapper.vm.changeLanguage('en');
      expect(currentLocale()).toBe('en');
    });
  });

  describe('ProfileView', () => {
    beforeEach(() => {
      (getProfile as jest.Mock).mockResolvedValue({
        id: 'u1',
        username: 'testuser',
        role: 'admin',
        provider: 'local',
        preferences: { theme: 'light', locale: 'zh-CN' },
        createdAt: '2024-01-01T00:00:00Z',
      });
      (listTokens as jest.Mock).mockResolvedValue([]);
    });

    it('renders the language selector', async () => {
      wrapper = mountWithBus(ProfileView);
      await wrapper.vm.loadProfileData();
      await wrapper.vm.$nextTick();
      expect(wrapper.html()).toContain('language-select');
      expect(wrapper.text()).toContain('界面语言');
    });

    it('applies the new language, saves it and notifies', async () => {
      wrapper = mountWithBus(ProfileView);
      await wrapper.vm.loadProfileData();

      await wrapper.vm.onLocaleChange('en');

      expect(currentLocale()).toBe('en');
      expect(updatePreferences).toHaveBeenCalledWith({ locale: 'en' });
    });

    it('rolls back to the previous language when saving fails', async () => {
      wrapper = mountWithBus(ProfileView);
      await wrapper.vm.loadProfileData();

      (updatePreferences as jest.Mock).mockRejectedValueOnce(new Error('forbidden'));
      await wrapper.vm.onLocaleChange('en');

      expect(currentLocale()).toBe('zh-CN');
    });
  });
});
