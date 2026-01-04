export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CompletionOptions {
    model?: string;
    max_tokens?: number;
    temperature?: number;
}

export class OpenAIClient {
    private apiKey: string;
    private apiBaseUrl: string = "https://api.openai.com/v1";

    private get chatCompletionUrl(): string {
        return `${this.apiBaseUrl}/chat/completions`;
    }

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async completion(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
        const {
            model = import.meta.env.VITE_OPENAI_DEFAULT_MODEL || "gpt-4.1-nano",
            max_tokens = 3000,
            temperature = 0.1
        } = options;

        const response = await fetch(this.chatCompletionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens,
                temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || response.statusText;
            throw new Error(`OpenAI API failed: ${errorMessage}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    }

    async listModels(): Promise<any[]> {
        const response = await fetch(`${this.apiBaseUrl}/models`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || response.statusText;
            throw new Error(`OpenAI API failed: ${errorMessage}`);
        }

        const data = await response.json();
        return data.data || [];
    }
}
