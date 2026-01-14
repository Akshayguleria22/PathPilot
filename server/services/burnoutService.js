export const detectBurnout = (week) => {
    let risk = 0;

    if (week.avgSleep < 6) risk++;
    if (week.avgStress > 7) risk++;
    if (week.avgStudy < 2) risk++;

    if (risk >= 2) {
        return {
            level: "high",
            message:
                "Burnout risk detected. Reduce workload and prioritize rest."
        };
    }

    if (risk === 1) {
        return {
            level: "medium",
            message:
                "Early burnout signs. Maintain balance and consistency."
        };
    }

    return {
        level: "low",
        message: "You're doing well. Keep it up!"
    };
};
