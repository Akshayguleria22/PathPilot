import axios from "axios";

const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_DETAILS = "https://www.googleapis.com/youtube/v3/videos";

export async function searchYouTube(query) {
    try {
        if (!process.env.YOUTUBE_API_KEY) {
            console.warn("YOUTUBE_API_KEY not configured");
            return [];
        }

        // Search for videos
        const searchRes = await axios.get(YOUTUBE_BASE, {
            params: {
                part: "snippet",
                q: query,
                type: "video",
                maxResults: 12,
                key: process.env.YOUTUBE_API_KEY,
                videoDuration: "medium", // 4-20 mins
                relevanceLanguage: "en",
            },
        });

        if (!searchRes.data.items || searchRes.data.items.length === 0) {
            return [];
        }

        // Get video details (duration, stats)
        const videoIds = searchRes.data.items.map((item) => item.id.videoId).join(",");
        const detailsRes = await axios.get(YOUTUBE_VIDEO_DETAILS, {
            params: {
                part: "contentDetails,statistics",
                id: videoIds,
                key: process.env.YOUTUBE_API_KEY,
            },
        });

        // Merge search results with details
        const results = searchRes.data.items.map((item, index) => {
            const details = detailsRes.data.items[index];
            const duration = parseDuration(details?.contentDetails?.duration || "PT0S");
            const views = parseInt(details?.statistics?.viewCount || "0");

            return {
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.medium.url,
                duration,
                views,
                type: "video",
                source: "youtube",
            };
        });

        return results
            .filter(v =>
                v.duration > 180 &&
                !v.title.toLowerCase().includes("shorts") &&
                !v.title.includes("#")
            )
            .slice(0, 6);
    } catch (error) {
        console.error("YouTube search error:", error.message);
        return [];
    }
}

// Helper: Convert ISO 8601 duration to seconds
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeVideos(query) {
    const rawResults = await searchYouTube(query);

    return rawResults
        .filter(v =>
            v.title.length > 20 &&
            !v.title.toLowerCase().includes("shorts") &&
            !v.title.toLowerCase().includes("#") &&
            v.duration > 180 &&
            v.views > 10000
        )
        .slice(0, 6)
        .map(v => ({
            type: "video",
            title: v.title,
            url: v.url,
            thumbnail: v.thumbnail,
            duration: v.duration,
            views: v.views,
            source: "youtube"
        }));
}
