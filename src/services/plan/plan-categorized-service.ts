import { FinanceItem } from "@/types/finance";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CategoryDefinition } from "@/types/category";
import { categorizePlanWithAI } from "../ai-service";
import { validateCategorizationMapping } from "./plan-validation-service";

/**
 * Service to handle categorization of financial plan items using AI.
 */
export const planCategorizedService = {
    /**
     * Categorizes the provided plan items using AI.
     * Includes a 24-hour cache in localStorage to optimize API usage.
     * 
     * @param items List of finance items to categorize
     * @returns Categorization mapping
     */
    async categorizePlan(items: FinanceItem[], userCategories: CategoryDefinition[] = [], model?: string) {
        if (items.length === 0) {
            console.log("No items to categorize.");
            return null;
        }

        // 1. Transform items into a list of unique name & description strings
        const uniqueItemsMap = new Map<string, { name: string, description?: string }>();

        items.forEach(item => {
            const key = `${item.name}|${item.description || ''}`;
            if (!uniqueItemsMap.has(key)) {
                uniqueItemsMap.set(key, { name: item.name, description: item.description });
            }
        });

        const itemsToCategorize = Array.from(uniqueItemsMap.values()).map(item => {
            if (item.description) {
                return `${item.name} (${item.description})`;
            }
            return item.name;
        });

        const planDataString = JSON.stringify(itemsToCategorize);
        // Note: We also need to hash user categories so cache invalidates if they change
        const categoriesHash = JSON.stringify(userCategories);
        const compositeHash = `${planDataString}|${categoriesHash}`;

        // --- Cache Logic ---
        const CACHE_KEY = 'fma-categorization-cache';
        const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days (1 month)
        const now = Date.now();

        try {
            const cachedValue = localStorage.getItem(CACHE_KEY);
            if (cachedValue) {
                const { timestamp, itemsHash, result } = JSON.parse(cachedValue);
                // Only return cache if it's recent AND the items/categories haven't changed
                if (now - timestamp < CACHE_DURATION && itemsHash === compositeHash) {
                    console.log("Using cached AI categorization result (Valid for 30 days).");
                    return result;
                }
            }
        } catch (e) {
            console.warn("Failed to read categorization cache:", e);
        }

        // 2. Prepare supported categories string for AI
        // Combine system and user categories
        const incomeCats = [...INCOME_CATEGORIES, ...userCategories.filter(c => c.type === 'Income')];
        const expenseCats = [...EXPENSE_CATEGORIES, ...userCategories.filter(c => c.type === 'Expense')];

        const incomeCategoriesString = JSON.stringify(incomeCats.map(c => ({
            id: c.id,
            label: c.translationKey.split('.').pop() // Logic works for both: 'category.salary' -> 'salary', 'My Custom Cat' -> 'My Custom Cat'
        })), null, 2);

        const expenseCategoriesString = JSON.stringify(expenseCats.map(c => ({
            id: c.id,
            label: c.translationKey.split('.').pop()
        })), null, 2);

        // 3. Call AI Service
        try {
            const aiResponse = await categorizePlanWithAI(planDataString, incomeCategoriesString, expenseCategoriesString, model);

            // 4. Validate Response
            const validatedMapping = validateCategorizationMapping(aiResponse);

            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: now,
                    itemsHash: compositeHash,
                    result: validatedMapping
                }));
            } catch (e) {
                console.warn("Failed to save categorization cache:", e);
            }

            return validatedMapping;
        } catch (error) {
            console.error("Failed to categorize plan:", error);
            throw error;
        }
    },

    /**
     * Clears the categorization cache.
     * Useful when importing new data that should be re-evaluated.
     */
    clearCache() {
        try {
            localStorage.removeItem('fma-categorization-cache');
            console.log("Categorization cache cleared.");
        } catch (e) {
            console.warn("Failed to clear categorization cache:", e);
        }
    }
};
