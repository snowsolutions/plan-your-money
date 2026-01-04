/**
 * Utility for encrypting and decrypting .fma files using Web Crypto API.
 * Uses AES-GCM for encryption and SHA-256 for key derivation.
 */

async function deriveKey(rawKey: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(rawKey);

    // Hash the key to ensure it's the correct length for AES-256
    const hash = await crypto.subtle.digest('SHA-256', keyData);

    return crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptData(data: string, secretKey: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const key = await deriveKey(secretKey);

    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    // Concatenate IV and encrypted content
    const result = new Uint8Array(iv.length + encryptedContent.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedContent), iv.length);

    return result;
}

export async function decryptData(buffer: Uint8Array, secretKey: string): Promise<string> {
    const key = await deriveKey(secretKey);

    // Extract IV (first 12 bytes) and content
    const iv = buffer.slice(0, 12);
    const content = buffer.slice(12);

    const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        content
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
}
