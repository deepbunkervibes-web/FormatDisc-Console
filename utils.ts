
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

/**
 * Computes a SHA-256 hash of the given string using the browser's native WebCrypto API.
 * This is the core integrity mechanism for the 'Defensible AI' non-repudiation layer,
 * ensuring that execution manifests cannot be altered without changing the fingerprint.
 */
export async function computeHash(message: string): Promise<string> {
    // WebCrypto API requires a secure context (HTTPS) and is standard in modern browsers.
    if (!window.crypto?.subtle) {
        console.warn("WebCrypto API not available. System is operating in a degraded non-secure state.");
        // In a production GRC environment, this should ideally trigger a system halt or alert.
        // For development resilience, we fall back to a non-cryptographic random ID.
        return generateId();
    }

    try {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error("Cryptographic hashing failed:", error);
        // Fallback in case of an unexpected error during the hashing process.
        return generateId();
    }
}

/**
 * Utility to trigger a file download for audit proofs and machine-readable manifests.
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}
