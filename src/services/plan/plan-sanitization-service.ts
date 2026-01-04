import { FinanceItem } from "@/types/finance";
import { parseXMLToItems, exportToXML } from "@/utils/fma-storage";

export const sanitize = (xmlContent: string): string => {
    // 1. Parse XML to objects
    let items: FinanceItem[];
    let userCategories: any[] = [];
    try {
        const result = parseXMLToItems(xmlContent);
        items = result.items;
        userCategories = result.userCategories;
    } catch (error) {
        throw new Error(`Failed to parse XML for sanitization: ${(error as Error).message}`);
    }

    const processedItems: FinanceItem[] = [];
    // We'll keep track of processed series to identify "source" items vs generated duplicates if duplicates already existed?
    // Actually, the prompt says "find out every recurring item ... to add up missing item".
    // This implies we should treat existing items as the source of truth, but if it is recurring, we ensure the rest of the series exists.

    // To properly handle this, we should iterate through items. 
    // If an item is 'Recurring', we generate its siblings if they don't exist in the input list.

    // First, let's group existing items by ID or SeriesID to see what's already there?
    // Or just process straight.

    // Strategy:
    // Iterate through the original list.
    // If Item is Not Recurring -> Add to Result.
    // If Item is Recurring:
    //    Add it to Result.
    //    Determine range of months it should cover.
    //    Check if siblings exist in the list (same SeriesId, same Year, specific MonthIndex).
    //    If missing, create clone with new ID, appropriate MonthIndex.

    // NOTE: The prompt implies the AI generates the "first" item. 
    // We need to be careful not to duplicate if the AI *did* generate 12 items.

    // Let's index existing items by SeriesId + Year + MonthIndex to quickly check existence.
    const itemMap = new Set<string>();
    items.forEach(item => {
        if (item.seriesId) {
            itemMap.add(`${item.seriesId}-${item.year}-${item.monthIndex}`);
        }
    });

    // Helper to generate a random ID (matching the 9-char alphanumeric constraint from prompt)
    const generateId = () => Math.random().toString(36).substr(2, 9);

    for (const item of items) {
        processedItems.push(item); // Always keep the original source item

        if (item.recurring && item.seriesId) {
            const startMonth = item.monthIndex;
            const year = item.year;
            let endMonth = 11; // Default for 'forever' (December)

            if (item.recurringType === 'until_date' && item.recurringUntilDate) {
                const untilDate = new Date(item.recurringUntilDate);
                // If recurring until date is in the same year, we stop at that month.
                // If it's in future years, we go until Dec (11) for this year.
                // If it's in past years, we shouldn't be generating? (Assume AI logic is consistent with request year)

                if (untilDate.getFullYear() === year) {
                    endMonth = untilDate.getMonth();
                } else if (untilDate.getFullYear() < year) {
                    endMonth = -1; // Should not happen for valid future recurring, but safeguards
                }
                // if untilDate.getFullYear() > year, endMonth remains 11
            }

            // Generate missing siblings
            // Start from startMonth + 1 because the current item is startMonth
            for (let m = startMonth + 1; m <= endMonth; m++) {
                const key = `${item.seriesId}-${year}-${m}`;
                if (!itemMap.has(key)) {
                    // Create new sibling
                    const newItem: FinanceItem = {
                        ...item,
                        id: generateId(),
                        monthIndex: m,
                        // Keep same SeriesId, Name, Amount, Type, Recurring flags
                    };
                    processedItems.push(newItem);
                    itemMap.add(key); // Mark as added so we don't double add if input was redundant
                }
            }
        }
    }

    // 2. Convert back to XML
    return exportToXML(processedItems, userCategories);
};
