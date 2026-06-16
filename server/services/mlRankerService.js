/**
 * ML Resource Ranker — Local JS-based scoring
 * Replaces the external Python sklearn model with an inline
 * weighted scoring formula (same inputs, same output shape).
 */
export const getMLRankScore = async (features) => {
    const { clicks, completions, score, confidence } = features;

    const rankScore =
        (clicks || 0) * 0.15 +
        (completions || 0) * 0.35 +
        (score || 0) * 0.30 +
        (confidence || 0) * 0.20;

    return rankScore;
};
