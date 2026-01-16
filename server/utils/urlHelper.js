/**
 * Remove trailing slash from URL to prevent double slashes
 * @param {string} url - The URL to normalize
 * @returns {string} - URL without trailing slash
 */
export function normalizeUrl(url) {
    if (!url) return '';
    return url.replace(/\/+$/, ''); // Remove one or more trailing slashes
}

/**
 * Get the AI service base URL without trailing slash
 * @returns {string} - Normalized AI service URL
 */
export function getAiServiceUrl() {
    return normalizeUrl(process.env.AI_SERVICE_URL || '');
}
