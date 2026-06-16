import axios from "axios";

/**
 * Search the web via SerpAPI. Degrades gracefully on failure.
 * @param {string} query - Search query
 * @param {number} numResults - Max results to return
 * @returns {Promise<Array<{title: string, snippet: string, link: string}>>}
 */
export async function searchWeb(query, numResults = 5) {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ SERP_API_KEY not set — web search unavailable");
        return [];
    }

    try {
        console.log(`🔍 Searching web: "${query}"`);
        const res = await axios.get("https://serpapi.com/search.json", {
            params: {
                q: query,
                api_key: apiKey,
                num: numResults,
                engine: "google",
            },
            timeout: 10000,
        });

        const results = res.data.organic_results || [];
        const formatted = results.slice(0, numResults).map(r => ({
            title: r.title || "",
            snippet: r.snippet || "",
            link: r.link || "",
        }));

        console.log(`✅ Web search returned ${formatted.length} results`);
        return formatted;
    } catch (err) {
        console.error(`❌ Web search failed for "${query}":`, err.message);
        return [];
    }
}

/**
 * Format search results as context text for LLM prompts.
 * @param {Array} results - Search results from searchWeb()
 * @returns {string} Formatted context string
 */
export function formatSearchContext(results) {
    if (!results || results.length === 0) {
        return "No web search results available.";
    }
    return results
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.link}`)
        .join("\n\n");
}
