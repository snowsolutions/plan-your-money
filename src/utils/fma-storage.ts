import { FinanceItem, ItemType } from '@/types/finance';
import { CategoryDefinition } from '@/types/category';
import { encryptData } from './fma-encryption';

export const exportToXML = (items: FinanceItem[], userCategories: CategoryDefinition[] = []): string => {
    // ... existing exportToXML implementation
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<FinancialManagementApp version="1.0">\n';

    // Items Section
    xml += '  <PlanItems>\n';
    items.forEach(item => {
        xml += '    <Item>\n';
        xml += `      <Id>${item.id}</Id>\n`;
        xml += `      <Type>${item.type}</Type>\n`;
        xml += `      <Name>${escapeXml(item.name)}</Name>\n`;
        xml += `      <Amount>${item.amount}</Amount>\n`;
        xml += `      <Recurring>${item.recurring}</Recurring>\n`;
        if (item.recurringType) xml += `      <RecurringType>${item.recurringType}</RecurringType>\n`;
        if (item.recurringUntilDate) xml += `      <RecurringUntilDate>${item.recurringUntilDate}</RecurringUntilDate>\n`;
        xml += `      <MonthIndex>${item.monthIndex}</MonthIndex>\n`;
        xml += `      <Year>${item.year}</Year>\n`;
        if (item.seriesId) xml += `      <SeriesId>${item.seriesId}</SeriesId>\n`;
        if (item.categoryIds && item.categoryIds.length > 0) xml += `      <CategoryIds>${item.categoryIds.join(',')}</CategoryIds>\n`;

        // FMA-4 fields
        if (item.structureType) xml += `      <StructureType>${item.structureType}</StructureType>\n`;
        if (item.status) xml += `      <Status>${item.status}</Status>\n`;
        if (item.recurringMode) xml += `      <RecurringMode>${item.recurringMode}</RecurringMode>\n`;
        if (item.installments !== undefined) xml += `      <Installments>${item.installments}</Installments>\n`;
        if (item.installmentIndex !== undefined) xml += `      <InstallmentIndex>${item.installmentIndex}</InstallmentIndex>\n`;

        if (item.subItems && item.subItems.length > 0) {
            xml += '      <SubItems>\n';
            item.subItems.forEach(sub => {
                xml += '        <SubItem>\n';
                xml += `          <Id>${sub.id}</Id>\n`;
                xml += `          <Name>${escapeXml(sub.name)}</Name>\n`;
                xml += `          <Price>${sub.price}</Price>\n`;
                if (sub.quantity !== undefined) xml += `          <Quantity>${sub.quantity}</Quantity>\n`;
                if (sub.description) xml += `          <Description>${escapeXml(sub.description)}</Description>\n`;
                xml += '        </SubItem>\n';
            });
            xml += '      </SubItems>\n';
        }

        xml += '    </Item>\n';
    });
    xml += '  </PlanItems>\n';

    // User Categories Section
    if (userCategories.length > 0) {
        xml += '  <UserCategories>\n';
        userCategories.forEach(cat => {
            xml += '    <Category>\n';
            xml += `      <Id>${cat.id}</Id>\n`;
            xml += `      <Name>${escapeXml(cat.translationKey)}</Name>\n`; // user categories use translationKey as name
            xml += `      <Type>${cat.type}</Type>\n`;
            // Icon is optional and not currently customized by user, but we can skip it or add defaults
            xml += '    </Category>\n';
        });
        xml += '  </UserCategories>\n';
    }

    xml += '</FinancialManagementApp>';
    return xml;
};

export const parseXMLToItems = (xmlString: string): { items: FinanceItem[], userCategories: CategoryDefinition[] } => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse errors
    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Invalid XML format');
    }

    const items: FinanceItem[] = [];
    const itemNodes = xmlDoc.querySelectorAll('PlanItems Item, Item'); // Fallback to 'Item' for backward compat or flat structure

    itemNodes.forEach(node => {
        // Ensure this is a finance item node, not a category node (if flat)
        if (node.parentElement?.tagName === 'UserCategories') return;

        const getVal = (selector: string) => node.querySelector(selector)?.textContent || '';

        const item: FinanceItem = {
            id: getVal('Id'),
            type: getVal('Type') as ItemType,
            name: getVal('Name'),
            amount: Number(getVal('Amount')),
            recurring: getVal('Recurring') === 'true',
            monthIndex: Number(getVal('MonthIndex')),
            year: Number(getVal('Year')),
        };

        const recurringType = getVal('RecurringType');
        if (recurringType) item.recurringType = recurringType as 'until_date' | 'forever';

        const recurringUntilDate = getVal('RecurringUntilDate');
        if (recurringUntilDate) item.recurringUntilDate = recurringUntilDate;

        const seriesId = getVal('SeriesId');
        if (seriesId) item.seriesId = seriesId;

        const categoryIds = getVal('CategoryIds');
        const categoryId = getVal('CategoryId'); // Backward compatibility

        if (categoryIds) {
            item.categoryIds = categoryIds.split(',').filter(Boolean);
        } else if (categoryId) {
            item.categoryIds = [categoryId];
        }

        // FMA-4 fields
        const structureType = getVal('StructureType');
        if (structureType) item.structureType = structureType as any;

        const status = getVal('Status');
        if (status) item.status = status as any;

        const recurringMode = getVal('RecurringMode');
        if (recurringMode) item.recurringMode = recurringMode as any;

        const installments = getVal('Installments');
        if (installments) item.installments = Number(installments);

        const installmentIndex = getVal('InstallmentIndex');
        if (installmentIndex) item.installmentIndex = Number(installmentIndex);

        const subItemNodes = node.querySelectorAll('SubItems SubItem');
        if (subItemNodes.length > 0) {
            item.subItems = [];
            subItemNodes.forEach(subNode => {
                const getSubVal = (selector: string) => subNode.querySelector(selector)?.textContent || '';
                item.subItems!.push({
                    id: getSubVal('Id'),
                    name: getSubVal('Name'),
                    price: Number(getSubVal('Price')),
                    quantity: getSubVal('Quantity') ? Number(getSubVal('Quantity')) : undefined,
                    description: getSubVal('Description'),
                });
            });
        }

        items.push(item);
    });

    // Parse User Categories
    const userCategories: CategoryDefinition[] = [];
    const categoryNodes = xmlDoc.querySelectorAll('UserCategories Category');

    categoryNodes.forEach(node => {
        const getVal = (selector: string) => node.querySelector(selector)?.textContent || '';
        const name = getVal('Name');
        const type = getVal('Type') as 'Income' | 'Expense';
        const id = getVal('Id');

        if (name && type && id) {
            userCategories.push({
                id,
                translationKey: name, // For user categories, name is stored in translationKey
                type,
                icon: undefined // Or default icon
            });
        }
    });

    return { items, userCategories };
};

const escapeXml = (unsafe: string): string => {
    // ... existing escapeXml implementation
    return unsafe.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
};

export const downloadFmaFile = async (items: FinanceItem[], userCategories: CategoryDefinition[] = [], encrypt: boolean = false, fileName: string = 'data') => {
    const xml = exportToXML(items, userCategories);
    let blob: Blob;
    let finalFileName = fileName;

    if (encrypt) {
        const encryptKey = import.meta.env.VITE_ENCRYPT_KEY;
        if (!encryptKey) {
            throw new Error('Encryption key not configured');
        }
        const encryptedData = await encryptData(xml, encryptKey);
        blob = new Blob([encryptedData as any], { type: 'application/octet-stream' });
        finalFileName += '.efma';
    } else {
        blob = new Blob([xml], { type: 'text/xml' });
        finalFileName += '.fma';
    }

    // Check if showSaveFilePicker is supported (modern Chrome/Edge)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: finalFileName,
                types: [{
                    description: encrypt ? 'Encrypted FMA File' : 'Financial Management App File',
                    accept: {
                        [encrypt ? 'application/octet-stream' : 'text/xml']: [encrypt ? '.efma' : '.fma']
                    },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('File Picker Error:', err);
        }
    }

    // Fallback: regular download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
