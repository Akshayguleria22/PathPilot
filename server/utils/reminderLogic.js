export function getReminderMessage({ hasTodayLog, streak }) {
    if (hasTodayLog) {
        if (streak >= 7) {
            return `Amazing! You're on a ${streak}-day streak! Keep up the excellent work!`;
        } else if (streak >= 3) {
            return `Great job! ${streak} days in a row. You're building a solid habit!`;
        } else {
            return `Good work logging today! Keep the momentum going.`;
        }
    } else {
        if (streak >= 3) {
            return `You have a ${streak}-day streak! Don't break it - log your habits today.`;
        } else if (streak > 0) {
            return `You're on a ${streak}-day streak. Log today to keep it going!`;
        } else {
            return `Start your day right - log your habits now!`;
        }
    }
}
