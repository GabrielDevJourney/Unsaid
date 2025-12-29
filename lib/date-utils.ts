/**
 * Get the Monday of the week for a given date.
 * Used to determine week boundaries for weekly insights.
 */
export const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Get the date range for a week (Monday 00:00 to Sunday 23:59:59).
 */
export const getWeekRange = (weekStart: string): { start: Date; end: Date } => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
