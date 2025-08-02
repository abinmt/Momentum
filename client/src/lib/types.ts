export interface TaskProgress {
    taskId: string;
    date: string;
    completed: boolean;
    value?: number;
    duration?: number;
    notes?: string;
}

export interface DailyStats {
    date: string;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
}

export interface WeeklyStats {
    week: string;
    dailyStats: DailyStats[];
    weeklyCompletionRate: number;
    totalCompletions: number;
}

export interface UserStatistics {
    totalTasks: number;
    totalCompletions: number;
    bestStreak: number;
    currentActiveStreaks: number;
    completionRate: number;
    weeklyStats: WeeklyStats[];
    monthlyProgress: { month: string; completions: number }[];
}

export interface TaskWithProgress {
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
    todayProgress?: TaskProgress;
    weekProgress?: TaskProgress[];
}

export interface JournalEntryWithMood {
    id: string;
    date: string;
    content: string;
    mood?: number;
    attachments?: string[];
}

export interface SharedTaskInfo {
    id: string;
    taskId: string;
    sharedBy: {
        id: string;
        firstName?: string;
        lastName?: string;
        profileImageUrl?: string;
    };
    task: {
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
