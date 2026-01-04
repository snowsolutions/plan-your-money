import { parseXMLToItems } from "@/utils/fma-storage";
import { FinanceItem } from "@/types/finance";

/**
 * Validates the XML content structure and values for FMA data.
 * Throws an error if validation fails.
 * 
 * @param xmlContent The raw XML string
 * @returns The parsed FinanceItem[] if valid
 */
export const validateFMAData = (xmlContent: string): FinanceItem[] => {
    if (!xmlContent || !xmlContent.trim()) {
        throw new Error("Empty content received.");
    }

    // Use the existing utility to parsing. It includes basic structure checks.
    let items: FinanceItem[];
    try {
        const result = parseXMLToItems(xmlContent);
        items = result.items;
    } catch (e) {
        throw new Error(`Invalid XML Structure: ${(e as Error).message}`);
    }

    if (!Array.isArray(items)) {
        throw new Error("Parsed data is not an array of items.");
    }

    // Deep validation of individual items
    items.forEach((item, index) => {
        if (!item.id) throw new Error(`Item at index ${index} missing ID.`);
        if (item.type !== 'Income' && item.type !== 'Expense') {
            throw new Error(`Item '${item.name || index}' has invalid type: ${item.type}. Must be 'Income' or 'Expense'.`);
        }
        if (typeof item.amount !== 'number' || isNaN(item.amount) || item.amount < 0) {
            throw new Error(`Item '${item.name || index}' has invalid amount: ${item.amount}. Must be a positive number.`);
        }
        if (typeof item.recurring !== 'boolean') {
            // Note: parseXMLToItems converts string "true"/"false" to boolean, so this checks if that process worked or if data was garbage
            // But parseXMLToItems sets recurring to (val === 'true'), so it's always boolean.
            // We might want to check if the XML source actually had valid boolean strings if we were stricter.
        }

        // Month index validation
        if (typeof item.monthIndex !== 'number' || item.monthIndex < 0 || item.monthIndex > 11) {
            throw new Error(`Item '${item.name || index}' has invalid MonthIndex: ${item.monthIndex}. Must be 0-11.`);
        }

        // Year validation
        if (typeof item.year !== 'number' || isNaN(item.year)) {
            throw new Error(`Item '${item.name || index}' has invalid Year.`);
        }
    });

    return items;
};

/**
 * Validates the categorization mapping returned by AI.
 * 
 * @param jsonString Raw JSON response from AI
 * @returns Parsed and validated mapping
 */
export const validateCategorizationMapping = (jsonString: string): { mapping: { value: string, categories: string[] }[] } => {
    if (!jsonString || !jsonString.trim()) {
        throw new Error("Empty categorization response received.");
    }

    let parsed: any;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e) {
        throw new Error(`Invalid JSON format in categorization: ${(e as Error).message}`);
    }

    if (!parsed || !Array.isArray(parsed.mapping)) {
        throw new Error("Invalid categorization structure: missing mapping array.");
    }

    parsed.mapping.forEach((item: any, index: number) => {
        if (typeof item.value !== 'string') {
            throw new Error(`Mapping at index ${index} missing 'value' string.`);
        }
        if (!Array.isArray(item.categories)) {
            throw new Error(`Mapping for '${item.value}' missing 'categories' array.`);
        }
    });

    return parsed;
};
