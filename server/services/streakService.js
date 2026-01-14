export const calculateStreak = (habits) => {
    if (!habits.length) return 0;

    const dates = habits
        .map(h => new Date(h.date))
        .sort((a, b) => b - a);

    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
        const diff =
            (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);

        if (diff === 1) streak++;
        else break;
    }

    return streak;
};
