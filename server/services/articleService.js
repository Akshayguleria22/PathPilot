export async function fetchArticles(query) {
    try {
        if (!process.env.SERP_API_KEY) {
            console.warn("SERP_API_KEY not configured, returning empty results");
            return [];
        }

        const res = await fetch(
            `https://serpapi.com/search.json?q=${encodeURIComponent(
                query + " tutorial"
            )}&engine=google&api_key=${process.env.SERP_API_KEY}`
        );

        if (!res.ok) {
            throw new Error(`SERP API error: ${res.status}`);
        }

        const data = await res.json();

        return (data.organic_results || [])
            .filter(r => r.link && r.snippet)
            .slice(0, 5)
            .map(r => ({
                title: r.title,
                url: r.link,
                snippet: r.snippet,
                type: "article",
                source: "web",
                thumbnail: r.thumbnail || null
            }));
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}
