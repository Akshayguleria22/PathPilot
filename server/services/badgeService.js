export const getBadges = (streak, totalDays, totalStudyHours, coursesCompleted) => {
    const badges = [];

    if (streak >= 7) badges.push("Week Warrior");
    if (streak >= 14) badges.push("Fortnight Fighter");
    if (streak >= 30) badges.push("Monthly Master");
    if (streak >= 60) badges.push("Consistency Champion");
    if (streak >= 90) badges.push("Quarter Legend");
    if (streak >= 100) badges.push("Century Achiever");
    if (streak >= 180) badges.push("Half Year Hero");
    if (streak >= 365) badges.push("Year Long Warrior");
    if (streak >= 500) badges.push("Unstoppable Force");
    if (streak >= 730) badges.push("Two Year Titan");

    // Total Days Logged
    if (totalDays >= 30) badges.push("30 Days Strong");
    if (totalDays >= 50) badges.push("50 Days Dedicated");
    if (totalDays >= 100) badges.push("100 Days Milestone");
    if (totalDays >= 200) badges.push("200 Days Legend");
    if (totalDays >= 365) badges.push("Year Tracker");

    // Study Hours Milestones
    if (totalStudyHours >= 50) badges.push("Study Starter");
    if (totalStudyHours >= 100) badges.push("Study Enthusiast");
    if (totalStudyHours >= 250) badges.push("Study Master");
    if (totalStudyHours >= 500) badges.push("Study Legend");
    if (totalStudyHours >= 1000) badges.push("Study Titan");

    // Course Achievements
    if (coursesCompleted >= 1) badges.push("First Course Complete");
    if (coursesCompleted >= 3) badges.push("Triple Threat");
    if (coursesCompleted >= 5) badges.push("Five Star Learner");
    if (coursesCompleted >= 10) badges.push("Course Collector");
    if (coursesCompleted >= 20) badges.push("Knowledge Seeker");
    if (coursesCompleted >= 50) badges.push("Course Master");

    return badges;
};
