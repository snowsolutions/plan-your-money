import { useI18n } from "@/providers/i18n-provider";

export const useTranslation = () => {
    const { t, language, setLanguage } = useI18n();
    return { t, i18n: { language, changeLanguage: setLanguage } };
};
