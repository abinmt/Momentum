export interface HabitProgress {
    taskId: string;
    date: string;
    completed: boolean;
    value?: number;
    duration?: number;
    notes?: string;
}

export interface DailyStats {
    date: string;
    completedHabits: number;
    totalHabits: number;
    completionRate: number;
}

export interface WeeklyStats {
    week: string;
    dailyStats: DailyStats[];
    weeklyCompletionRate: number;
    totalCompletions: number;
}

export interface UserStatistics {
    totalHabits: number;
    totalCompletions: number;
    bestStreak: number;
    currentActiveStreaks: number;
    completionRate: number;
    weeklyStats: WeeklyStats[];
    monthlyProgress: { month: string; completions: number }[];
}

export interface HabitWithProgress {
    id: string;
    title: string;
    description?: string;
    icon: string;
    color: string;
    type: "simple" | "timed" | "health" | "negative";
    goal?: number;
    goalUnit?: string;
    schedule: string;
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    todayProgress?: HabitProgress;
    weekProgress?: HabitProgress[];
}

export interface JournalEntryWithMood {
    id: string;
    date: string;
    content: string;
    mood?: number;
    attachments?: string[];
}

export interface SharedHabitInfo {
    id: string;
    habitId: string;
    sharedBy: {
        id: string;
        firstName?: string;
        lastName?: string;
        profileImageUrl?: string;
    };
    habit: {
        title: string;
        icon: string;
        color: string;
        currentStreak: number;
    };
    sharedAt: string;
}

export interface NotificationSettings {
    enabled: boolean;
    reminderTime?: string;
    customTimes?: string[];
    soundEnabled: boolean;
    sound?: string;
    timeSensitive: boolean;
}

export interface ThemeSettings {
    colorTheme: string;
    accentColor: string;
    backgroundGradient: string;
    cardStyle: "glass" | "solid" | "outline";
    iconStyle: "rounded" | "sharp" | "minimal";
}

export interface AppSettings {
    notifications: NotificationSettings;
    theme: ThemeSettings;
    privacy: {
        shareProgress: boolean;
        allowDataExport: boolean;
    };
    backup: {
        autoBackup: boolean;
        backupFrequency: "daily" | "weekly" | "monthly";
    };
}
