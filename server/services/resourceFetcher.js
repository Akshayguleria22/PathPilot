export async function fetchResources({ topic, courseId, refresh = false }) {
    const videos = await fetchYouTubeVideos(topic);
    const articles = await fetchArticles(topic);
    const docs = await fetchDocs(topic);

    return {
        videos: videos.slice(0, 4),
        articles: articles.slice(0, 3),
        docs: docs.slice(0, 2),
    };
}
