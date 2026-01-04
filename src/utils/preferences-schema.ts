export type OpenAIApiKeySource =
    | 'VITE_OPENAI_API_KEY'
    | 'VITE_OPENAI_API_KEY_BACKUP_1'
    | 'VITE_OPENAI_API_KEY_BACKUP_2'
    | 'VITE_OPENAI_API_KEY_BACKUP_3';

export interface AppPreferences {
    global: {
        theme: 'light' | 'dark';
        currency: string;
        language: string;
        aiModel: string;
        openaiApiKeySource: OpenAIApiKeySource;
    };
    tabs: {
        plan: {
            viewMode: 'vertical' | 'horizontal';
        };
    };
}

export const DEFAULT_PREFERENCES: AppPreferences = {
    global: {
        theme: 'dark',
        currency: 'đ',
        language: 'en-us',
        aiModel: import.meta.env.VITE_OPENAI_DEFAULT_MODEL || 'gpt-4.1-nano',
        openaiApiKeySource: 'VITE_OPENAI_API_KEY',
    },
    tabs: {
        plan: {
            viewMode: 'vertical',
        },
    },
};
