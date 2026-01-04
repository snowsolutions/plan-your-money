import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');
const I18N_DIR = path.join(__dirname, '..', 'i18n');
const VI_VN_CSV = path.join(I18N_DIR, 'vi-vn.csv');
const EN_US_CSV = path.join(I18N_DIR, 'en-us.csv');
const OUTPUT_CSV = path.join(I18N_DIR, 'missing-keys.csv');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

function extractKeysFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Using word boundary \b to avoid matching handleSort, etc.
    // Supports t('key') and t('key', { params })
    const regex = /\bt\(['"]([^'"]+)['"][,)]/g;
    const keys = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

function parseCsvKeys(filePath) {
    if (!fs.existsSync(filePath)) return new Set();
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const keys = new Set();
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const firstCommaIndex = line.indexOf(',');
            if (firstCommaIndex !== -1) {
                keys.add(line.substring(0, firstCommaIndex).trim());
            } else {
                keys.add(line);
            }
        }
    }
    return keys;
}

function main() {
    console.log('Scanning components for translation keys...');
    const files = getAllFiles(COMPONENTS_DIR);
    const usedKeys = new Set();

    files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
            const keys = extractKeysFromFile(file);
            keys.forEach(key => usedKeys.add(key));
        }
    });

    console.log(`Found ${usedKeys.size} unique translation keys in code.`);

    const viKeys = parseCsvKeys(VI_VN_CSV);
    const enKeys = parseCsvKeys(EN_US_CSV);

    const missingInVi = [];
    const missingInEn = [];
    const missingInBoth = [];

    usedKeys.forEach(key => {
        // Ignore dynamic keys or keys with placeholders like {count}
        // Actually, the regex extracts the whole string literal, so {count} is fine if it's part of the literal
        // But if someone did t(`key.${var}`), my regex won't catch it anyway.

        const inVi = viKeys.has(key);
        const inEn = enKeys.has(key);

        if (!inVi && !inEn) {
            missingInBoth.push(key);
        } else if (!inVi) {
            missingInVi.push(key);
        } else if (!inEn) {
            missingInEn.push(key);
        }
    });

    console.log('\n--- Missing Keys Report ---');

    if (missingInBoth.length > 0) {
        console.log(`\nMissing in BOTH vi-vn.csv and en-us.csv (${missingInBoth.length}):`);
        missingInBoth.sort().forEach(key => console.log(`  - ${key}`));
    }

    if (missingInVi.length > 0) {
        console.log(`\nMissing in vi-vn.csv ONLY (${missingInVi.length}):`);
        missingInVi.sort().forEach(key => console.log(`  - ${key}`));
    }

    if (missingInEn.length > 0) {
        console.log(`\nMissing in en-us.csv ONLY (${missingInEn.length}):`);
        missingInEn.sort().forEach(key => console.log(`  - ${key}`));
    }

    if (missingInBoth.length === 0 && missingInVi.length === 0 && missingInEn.length === 0) {
        console.log('\nNo missing keys found! All good.');
    }

    // Write to missing-keys.csv
    const csvContent = [
        'key,status',
        ...missingInBoth.sort().map(k => `${k},missing_in_both`),
        ...missingInVi.sort().map(k => `${k},missing_in_vi`),
        ...missingInEn.sort().map(k => `${k},missing_in_en`)
    ].join('\n');

    fs.writeFileSync(OUTPUT_CSV, csvContent);
    console.log(`\nResults written to: ${OUTPUT_CSV}`);
}

main();
