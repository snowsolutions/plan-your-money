import { AppPreferences, DEFAULT_PREFERENCES } from './preferences-schema';

export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

export const setCookie = (name: string, value: string, days: number = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict`;
};

export const loadPreferences = (): AppPreferences => {
    const saved = getCookie('fma_user_preferences');
    if (!saved) return DEFAULT_PREFERENCES;

    try {
        const parsed = JSON.parse(decodeURIComponent(saved));
        // Deep merge with defaults to ensure new keys are present
        return {
            global: { ...DEFAULT_PREFERENCES.global, ...parsed.global },
            tabs: {
                plan: { ...DEFAULT_PREFERENCES.tabs.plan, ...parsed.tabs?.plan }
            }
        };
    } catch (e) {
        console.error('Failed to parse preferences cookie', e);
        return DEFAULT_PREFERENCES;
    }
};

export const savePreferences = (prefs: AppPreferences) => {
    setCookie('fma_user_preferences', encodeURIComponent(JSON.stringify(prefs)));
};
