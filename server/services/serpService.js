/**
 * SERP API Service - Google Search Integration
 * Provides article search, news search, and general web search
 */

export async function searchWeb(query, options = {}) {
    try {
        if (!process.env.SERP_API_KEY) {
            console.warn("SERP_API_KEY not configured");
            return { success: false, results: [], error: "API key not configured" };
        }

        const {
            type = "organic", // organic, news, images
            limit = 10,
            location = "United States"
        } = options;

        const params = new URLSearchParams({
            q: query,
            engine: "google",
            api_key: process.env.SERP_API_KEY,
            location: location,
            num: limit
        });

        const res = await fetch(`https://serpapi.com/search.json?${params}`);

        if (!res.ok) {
            throw new Error(`SERP API error: ${res.status}`);
        }

        const data = await res.json();

        // Handle different result types
        let results = [];
        if (type === "news") {
            results = (data.news_results || []).slice(0, limit);
        } else if (type === "images") {
            results = (data.images_results || []).slice(0, limit);
        } else {
            results = (data.organic_results || []).slice(0, limit);
        }

        return {
            success: true,
            results: results.map(r => ({
                title: r.title,
                url: r.link,
                snippet: r.snippet || r.description || "",
                source: r.source || "web",
                thumbnail: r.thumbnail || null,
                position: r.position
            })),
            searchInfo: {
                query: data.search_parameters?.q,
                totalResults: data.search_information?.total_results,
                timeTaken: data.search_information?.time_taken_displayed
            }
        };
    } catch (error) {
        console.error("SERP search error:", error);
        return { success: false, results: [], error: error.message };
    }
}

export async function searchLearningResources(topic, options = {}) {
    try {
        const {
            includeVideos = true,
            includeArticles = true,
            includeDocs = true
        } = options;

        const results = {
            articles: [],
            documentation: [],
            tutorials: []
        };

        // Search for tutorials and articles
        if (includeArticles) {
            const articleSearch = await searchWeb(`${topic} tutorial beginner guide`, {
                limit: 5
            });
            results.articles = articleSearch.results || [];
        }

        // Search for official documentation
        if (includeDocs) {
            const docSearch = await searchWeb(`${topic} official documentation`, {
                limit: 3
            });
            results.documentation = docSearch.results || [];
        }

        // Search for interactive tutorials
        const tutorialSearch = await searchWeb(`${topic} interactive tutorial practice`, {
            limit: 3
        });
        results.tutorials = tutorialSearch.results || [];

        return {
            success: true,
            topic,
            resources: results
        };
    } catch (error) {
        console.error("Learning resources search error:", error);
        return { success: false, error: error.message };
    }
}

export async function searchNews(topic, limit = 5) {
    return searchWeb(topic, { type: "news", limit });
}
