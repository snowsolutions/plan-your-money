import { useState, useEffect, useRef } from 'react'
import { PlanHeading } from "@/components/plan/plan-heading"
import { PlanBody } from "@/components/plan/plan-body"
import { FloatingPreferences } from "@/components/floating-preferences"
import { ImportWarningModal } from "@/components/plan/modals/import-warning-modal"
import { PlanImportModal } from "@/components/plan/modals/plan-import-modal"
import { FinanceItem } from "@/types/finance"
import { CategoryDefinition } from "@/types/category"
import { ClearDataModal } from "@/components/plan/modals/clear-data-modal"
import { downloadFmaFile, parseXMLToItems } from "@/utils/fma-storage"
import { loadPreferences, savePreferences } from "@/utils/preferences-utils"
import { AppPreferences } from "@/utils/preferences-schema"
import { createPlanWithAI } from './services/ai-service';
import { validateFMAData } from './services/plan/plan-validation-service';
import { sanitize } from './services/plan/plan-sanitization-service';
import { calculateYearlyTotals } from './services/plan/plan-calculation-service';
import { TopNavbar } from '@/components/top-navbar'
import { planCategorizedService } from './services/plan/plan-categorized-service';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/providers/currency-provider';
import './app.css'

import { DashboardBody } from '@/components/dashboard/dashboard-body';
import { AdminPage } from '@/components/admin/admin-page';

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const YEARS = Array.from({ length: 21 }, (_, i) => CURRENT_YEAR - 10 + i);

function App() {
    const { i18n: { language } } = useTranslation();
    const { convert } = useCurrency();
    const initialPrefs = loadPreferences();
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>(initialPrefs.tabs.plan.viewMode);
    const [activeTab, setActiveTab] = useState<'plan' | 'dashboard' | 'reports' | 'admin'>(() => {
        return (localStorage.getItem('fma_active_tab') as any) || 'plan';
    });
    const [currencySymbol, setCurrencySymbol] = useState(initialPrefs.global.currency);
    const [theme, setTheme] = useState<'light' | 'dark'>(initialPrefs.global.theme);
    const [aiModel, setAiModel] = useState(initialPrefs.global.aiModel);
    const [openaiApiKeySource, setOpenaiApiKeySource] = useState(initialPrefs.global.openaiApiKeySource);
    const [isBlurred, setIsBlurred] = useState(false);

    // User Categories State
    const [userCategories, setUserCategories] = useState<CategoryDefinition[]>(() => {
        const saved = localStorage.getItem('user-categories');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse user categories", e);
                return [];
            }
        }
        return [];
    });

    // Items State
    const [items, setItems] = useState<FinanceItem[]>(() => {
        const saved = localStorage.getItem('finance-items');
        return saved ? JSON.parse(saved) : [];
    });

    const [showImportWarning, setShowImportWarning] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'import' | 'sample' | 'ai' | null>(null);
    const [pendingAIInstruction, setPendingAIInstruction] = useState<string | null>(null);
    const aiPromiseRef = useRef<{ resolve: () => void; reject: (reason?: any) => void } | null>(null);

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('user-categories', JSON.stringify(userCategories));
    }, [userCategories]);

    useEffect(() => {
        localStorage.setItem('finance-items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('fma_active_tab', activeTab);
    }, [activeTab]);

    // Categorization Logic
    const handleAutoCategorization = (currentItems: FinanceItem[]) => {
        if (currentItems.length > 0) {
            console.log("Triggering auto-categorization...");
            // Pass userCategories and aiModel to categorization service
            planCategorizedService.categorizePlan(currentItems, userCategories, aiModel)
                .then(result => {
                    if (result && result.mapping) {
                        console.log("AI Categorization Result:", result);

                        let hasChanges = false;
                        const newItems = currentItems.map(item => {
                            const itemKey = item.description ? `${item.name} (${item.description})` : item.name;
                            const match = result.mapping.find((m: any) => m.value === itemKey);

                            if (match && match.categories.length > 0) {
                                const newCategoryIds = match.categories;
                                const currentIds = item.categoryIds || [];

                                const isDifferent = newCategoryIds.length !== currentIds.length ||
                                    !newCategoryIds.every((val: any) => currentIds.includes(val));

                                if (isDifferent) {
                                    hasChanges = true;
                                    return { ...item, categoryIds: newCategoryIds };
                                }
                            }
                            return item;
                        });

                        if (hasChanges) {
                            console.log("Enriching plan data with AI categories...");
                            setItems(newItems);
                        }
                    }
                })
                .catch(err => {
                    console.error("AI Categorization failed:", err);
                });
        }
    };

    // Categorize items when switching to dashboard
    useEffect(() => {
        if (activeTab === 'dashboard') {
            handleAutoCategorization(items);
        }
    }, [activeTab]);

    // Sync preferences to cookie whenever state changes
    useEffect(() => {
        const newPrefs: AppPreferences = {
            global: {
                theme,
                currency: currencySymbol,
                language,
                aiModel,
                openaiApiKeySource
            },
            tabs: {
                plan: {
                    viewMode
                }
            }
        };
        savePreferences(newPrefs);

        // Update document class for theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme, currencySymbol, viewMode, language, aiModel, openaiApiKeySource]);

    // Sync API key source to localStorage as reference for services
    useEffect(() => {
        localStorage.setItem('fma_openai_api_key_source', openaiApiKeySource);
    }, [openaiApiKeySource]);


    const handleAddCategory = (cat: { name: string, type: 'Income' | 'Expense' }) => {
        // Simple ID generation
        const id = `user-cat-${Date.now()}`;
        const newCat: CategoryDefinition = {
            id,
            translationKey: cat.name, // Using name as key for now
            type: cat.type
        };
        setUserCategories(prev => [...prev, newCat]);
    };

    const handleEditCategory = (id: string, updates: { name: string, type: 'Income' | 'Expense' }) => {
        setUserCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, translationKey: updates.name, type: updates.type } : cat
        ));
    };

    const handleDeleteCategory = (id: string) => {
        setUserCategories(prev => prev.filter(cat => cat.id !== id));
    };

    const handleExport = (encrypt: boolean = false) => {
        downloadFmaFile(items, userCategories, encrypt, `financial-plan-${selectedYear}`);
    };

    const handleClearData = () => {
        setIsClearModalOpen(true);
    };

    const handleClearConfirmed = () => {
        // Clear cache when clearing data
        planCategorizedService.clearCache();
        setItems([]);
        setUserCategories([]);
        localStorage.removeItem('finance-items');
        localStorage.removeItem('user-categories');
        setIsClearModalOpen(false);
    };

    const handleImportClick = () => {
        if (items.length > 0) {
            setPendingAction('import');
            setShowImportWarning(true);
        } else {
            setIsImportModalOpen(true);
        }
    };

    const handleSampleClick = () => {
        if (items.length > 0) {
            setPendingAction('sample');
            setShowImportWarning(true);
        } else {
            loadSampleData();
        }
    };

    const loadSampleData = async () => {
        try {
            const response = await fetch('/samples/plan-sample-data.fma');
            const content = await response.text();
            const parsed = parseXMLToItems(content);
            const newItems = parsed.items;
            const loadedUserCats = parsed.userCategories || [];

            // New data loaded, clear old categorization cache
            planCategorizedService.clearCache();
            setItems(newItems);
            setUserCategories(loadedUserCats);
            // Trigger categorization immediately on fresh data
            handleAutoCategorization(newItems);
        } catch (err) {
            console.error('Failed to load sample data:', err);
        }
    };

    const processAIGenerate = async (instruction: string) => {
        const rawXmlContent = await createPlanWithAI(instruction, selectedYear, aiModel);
        const xmlContent = sanitize(rawXmlContent);

        const newItems = validateFMAData(xmlContent);
        // Generated new data, clear cache
        planCategorizedService.clearCache();
        setItems(newItems);
        // Trigger categorization immediately
        handleAutoCategorization(newItems);
    };

    const handleAIGenerate = async (instruction: string) => {
        if (items.length > 0) {
            return new Promise<void>((resolve, reject) => {
                aiPromiseRef.current = { resolve, reject };
                setPendingAction('ai');
                setPendingAIInstruction(instruction);
                setShowImportWarning(true);
            });
        } else {
            await processAIGenerate(instruction);
        }
    };

    const handleWarningConfirm = () => {
        if (pendingAction === 'import') {
            setIsImportModalOpen(true);
        } else if (pendingAction === 'sample') {
            loadSampleData();
        } else if (pendingAction === 'ai' && pendingAIInstruction) {
            processAIGenerate(pendingAIInstruction)
                .then(() => {
                    if (aiPromiseRef.current) aiPromiseRef.current.resolve();
                })
                .catch(err => {
                    console.error("AI Generation failed:", err);
                    if (aiPromiseRef.current) aiPromiseRef.current.reject(err);
                })
                .finally(() => {
                    aiPromiseRef.current = null;
                });
        }
        setShowImportWarning(false);
        setPendingAction(null);
        setPendingAIInstruction(null);
    };

    const handleFileSelected = (file: File): Promise<void> => {
        const isEncrypted = file.name.endsWith('.efma');

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    let content: string;

                    if (isEncrypted) {
                        const buffer = new Uint8Array(event.target?.result as ArrayBuffer);
                        const encryptKey = import.meta.env.VITE_ENCRYPT_KEY;
                        if (!encryptKey) throw new Error('Encryption key not configured');

                        const { decryptData } = await import('./utils/fma-encryption');
                        content = await decryptData(buffer, encryptKey);
                    } else {
                        content = event.target?.result as string;
                    }

                    const parsed = parseXMLToItems(content);
                    const newItems = parsed.items;
                    const loadedUserCats = parsed.userCategories || [];

                    // New data loaded from file, clear old categorization cache
                    planCategorizedService.clearCache();
                    setItems(newItems);
                    setUserCategories(loadedUserCats);

                    // Trigger categorization
                    handleAutoCategorization(newItems);
                    resolve();
                } catch (err) {
                    reject(new Error(isEncrypted ? 'Failed to decrypt or invalid .efma file.' : 'Invalid .fma file format.'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file.'));

            if (isEncrypted) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    // Convert helper for the calculating total
    const convertToAppCurrency = (amount: number, from: string) => convert(amount, from, currencySymbol);

    const { yearlyIncome, yearlyExpenses, netSavings: savings } = calculateYearlyTotals(items, selectedYear, false, convertToAppCurrency);

    return (
        <div className="app min-h-screen bg-background text-foreground flex flex-col">
            {/* Top Navigation Bar */}
            <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'plan' ? (
                <>
                    <PlanHeading
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        years={YEARS}
                        yearlyIncome={yearlyIncome}
                        yearlyExpenses={yearlyExpenses}
                        savings={savings}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        currencySymbol={currencySymbol}
                        onImport={handleImportClick}
                        onExport={handleExport}
                        onClear={handleClearData}
                        onSample={handleSampleClick}
                        onGenerate={handleAIGenerate}
                        onViewDashboard={() => setActiveTab('dashboard')}
                    />

                    <main className="px-8 pb-12">
                        <div className="w-full">
                            <PlanBody
                                selectedYear={selectedYear}
                                items={items}
                                setItems={setItems}
                                viewMode={viewMode}
                                currencySymbol={currencySymbol}
                                onSample={handleSampleClick}
                                userCategories={userCategories}
                            />
                        </div>
                    </main>
                </>
            ) : activeTab === 'dashboard' ? (
                <main className="flex-1">
                    <DashboardBody
                        items={items}
                        selectedYear={selectedYear}
                        currencySymbol={currencySymbol}
                        years={YEARS}
                        onYearChange={setSelectedYear}
                        onRefreshCategorization={() => {
                            // Clear cache first then re-run
                            planCategorizedService.clearCache();
                            handleAutoCategorization(items);
                        }}
                        userCategories={userCategories}
                        onAddCategory={handleAddCategory}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                    />
                </main>
            ) : activeTab === 'admin' ? (
                <main className="flex-1">
                    <AdminPage
                        currentModel={aiModel}
                        onModelChange={setAiModel}
                        currentApiKeySource={openaiApiKeySource}
                        onApiKeySourceChange={setOpenaiApiKeySource}
                    />
                </main>
            ) : (
                <main className="flex-1">
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <h2 className="text-xl font-bold">Reports Coming Soon</h2>
                    </div>
                </main>
            )}

            <FloatingPreferences
                currencySymbol={currencySymbol}
                setCurrencySymbol={setCurrencySymbol}
                isBlurred={isBlurred}
                setIsBlurred={setIsBlurred}
                theme={theme}
                setTheme={setTheme}
            />

            <ImportWarningModal
                isOpen={showImportWarning}
                onClose={() => {
                    setShowImportWarning(false);
                    if (aiPromiseRef.current && pendingAction === 'ai') {
                        aiPromiseRef.current.reject(new Error("Cancelled"));
                        aiPromiseRef.current = null;
                        setPendingAction(null);
                        setPendingAIInstruction(null);
                    }
                }}
                onConfirm={handleWarningConfirm}
            />

            <PlanImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onFileSelected={handleFileSelected}
            />

            <ClearDataModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onClear={handleClearConfirmed}
                onBackup={() => handleExport(false)}
            />
        </div>
    )
}

export default App
