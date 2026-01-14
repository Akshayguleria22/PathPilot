import { getMLRankScore } from "../services/mlRankerService.js";

export const rankResources = async (resources, userContext) => {
    const ranked = [];

    for (const r of resources) {
        const score = await getMLRankScore({
            clicks: r.clickCount,
            completions: r.completionCount,
            score: userContext.score || 50,
            confidence: userContext.confidence || 3,
        });

        ranked.push({ ...r.toObject(), mlScore: score });
    }

    return ranked.sort((a, b) => b.mlScore - a.mlScore);
};
