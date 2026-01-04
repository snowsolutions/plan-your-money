import { AdminHeading } from "./admin-heading";
import { AdminBody } from "./admin-body";
import { OpenAIApiKeySource } from "@/utils/preferences-schema";

interface AdminPageProps {
    currentModel: string;
    onModelChange: (model: string) => void;
    currentApiKeySource: OpenAIApiKeySource;
    onApiKeySourceChange: (source: OpenAIApiKeySource) => void;
}

export function AdminPage({
    currentModel,
    onModelChange,
    currentApiKeySource,
    onApiKeySourceChange
}: AdminPageProps) {
    return (
        <div className="admin-page-container flex flex-col min-h-full">
            <AdminHeading />
            <AdminBody
                currentModel={currentModel}
                onModelChange={onModelChange}
                currentApiKeySource={currentApiKeySource}
                onApiKeySourceChange={onApiKeySourceChange}
            />
        </div>
    );
}
