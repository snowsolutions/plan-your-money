/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_OPENAI_API_KEY_BACKUP_1: string
    readonly VITE_OPENAI_API_KEY_BACKUP_2: string
    readonly VITE_OPENAI_API_KEY_BACKUP_3: string
    readonly VITE_ENCRYPT_KEY: string
    readonly VITE_OPENAI_DEFAULT_MODEL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module "*.md?raw" {
    const content: string;
    export default content;
}

declare module "*.csv?raw" {
    const content: string;
    export default content;
}
