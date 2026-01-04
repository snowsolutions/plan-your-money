import planStartPromptTemplate from '../ai/system-prompt/plan-start.ai.md?raw';
import planCategorizePromptTemplate from '../ai/system-prompt/plan-categorize.md?raw';
import { OpenAIClient } from './open-ai-client';

const API_KEY_SOURCES = [
    'VITE_OPENAI_API_KEY',
    'VITE_OPENAI_API_KEY_BACKUP_1',
    'VITE_OPENAI_API_KEY_BACKUP_2',
    'VITE_OPENAI_API_KEY_BACKUP_3',
];

/**
 * Gets the API keys in order of preference.
 * The user-selected key comes first, followed by others.
 */
function getOrderedApiKeys(): string[] {
    const preferredSource = localStorage.getItem('fma_openai_api_key_source') || 'VITE_OPENAI_API_KEY';

    const keyMap: Record<string, string | undefined> = {
        'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
        'VITE_OPENAI_API_KEY_BACKUP_1': import.meta.env.VITE_OPENAI_API_KEY_BACKUP_1,
        'VITE_OPENAI_API_KEY_BACKUP_2': import.meta.env.VITE_OPENAI_API_KEY_BACKUP_2,
        'VITE_OPENAI_API_KEY_BACKUP_3': import.meta.env.VITE_OPENAI_API_KEY_BACKUP_3,
    };

    const orderedSources = [
        preferredSource,
        ...API_KEY_SOURCES.filter(s => s !== preferredSource)
    ];

    return orderedSources
        .map(s => keyMap[s])
        .filter((k): k is string => !!k);
}

/**
 * Executes a function with automatic API key fallback on failure.
 */
async function withFallback<T>(action: (client: OpenAIClient) => Promise<T>): Promise<T> {
    const keys = getOrderedApiKeys();
    let lastError: any;

    for (const key of keys) {
        try {
            const client = new OpenAIClient(key);
            return await action(client);
        } catch (error: any) {
            lastError = error;
            const message = error.message.toLowerCase();

            // Fallback on rate limit, quota exceeded, or unauthorized (if key is invalid)
            const shouldFallback =
                message.includes('rate limit') ||
                message.includes('quota') ||
                message.includes('insufficient') ||
                message.includes('unauthorized') ||
                message.includes('429') ||
                message.includes('401');

            if (shouldFallback) {
                console.warn(`API Key failed, trying backup... Error: ${error.message}`);
                continue;
            }

            // Otherwise throw immediately
            throw error;
        }
    }

    throw lastError || new Error("All API keys failed.");
}

/**
 * Creates a financial plan using OpenAI based on user instructions.
 */
export async function createPlanWithAI(userInput: string, targetYear: number, model?: string): Promise<string> {
    if (!userInput || !userInput.trim()) {
        throw new Error("User prompt cannot be empty.");
    }

    const systemPrompt = planStartPromptTemplate
        .replace('{USER_PROMPT_INPUT}', userInput)
        .replace('{TARGET_YEAR}', targetYear.toString());

    return withFallback(async (client) => {
        const content = await client.completion([
            {
                role: "system",
                content: systemPrompt
            }
        ], {
            model,
            temperature: 0.1
        });

        return content.replace(/```xml/g, '').replace(/```/g, '').trim();
    });
}

/**
 * Categorizes a list of plan items using AI.
 */
export async function categorizePlanWithAI(planData: string, incomeCategories: string, expenseCategories: string, model?: string): Promise<string> {
    const systemPrompt = planCategorizePromptTemplate
        .replace('{PLAN_DATA}', planData)
        .replace('{INCOME_ONLY_CATEGORIES}', incomeCategories)
        .replace('{EXPENSE_ONLY_CATEGORIES}', expenseCategories);

    return withFallback(async (client) => {
        const content = await client.completion([
            {
                role: "system",
                content: systemPrompt
            }
        ], {
            model,
            temperature: 0.1
        });

        return content.replace(/```json/g, '').replace(/```/g, '').trim();
    });
}

/**
 * Gets the list of supported AI models from OpenAI.
 */
export async function getSupportedAIModels(): Promise<any[]> {
    return withFallback(async (client) => {
        return await client.listModels();
    });
}
