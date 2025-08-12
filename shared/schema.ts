import { sql } from 'drizzle-orm';
import {
    index,
    jsonb,
    pgTable,
    timestamp,
    varchar,
    text,
    integer,
    boolean,
    date,
    unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
    "sessions",
    {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull(),
    },
    (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    // Settings
    notificationsEnabled: boolean("notifications_enabled").default(true),
    soundEnabled: boolean("sound_enabled").default(true),
    vibrationEnabled: boolean("vibration_enabled").default(true),
    darkModeEnabled: boolean("dark_mode_enabled").default(true),
    reminderTime: integer("reminder_time").default(19), // 7 PM
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks/Habits table
export const tasks = pgTable("tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    description: text("description"),
    icon: varchar("icon").notNull().default("check"),
    color: varchar("color").notNull().default("primary"),
    type: varchar("type"), // simple, timed, health, negative - now optional
    goal: integer("goal"), // e.g., 5000 steps, 30 minutes
    goalUnit: varchar("goal_unit"), // steps, minutes, calories, etc.
    isDayLongTask: boolean("is_day_long_task").default(false), // New field for day-long tasks
    schedule: varchar("schedule").notNull().default("daily"), // daily, weekdays, custom
    customDays: jsonb("custom_days"), // [1,2,3,4,5] for mon-fri
    selectedDays: varchar("selected_days").default("mon,tue,wed,thu,fri,sat,sun"), // New field for task days
    timesPerWeek: integer("times_per_week"), // for flexible scheduling
    reminderEnabled: boolean("reminder_enabled").default(false),
    reminderTime: varchar("reminder_time"), // "09:00" format
    isPrivate: boolean("is_private").default(false),
    isActive: boolean("is_active").notNull().default(true),
    currentStreak: integer("current_streak").notNull().default(0),
    bestStreak: integer("best_streak").notNull().default(0),
    totalCompletions: integer("total_completions").notNull().default(0),
    displayOrder: integer("display_order").notNull().default(0),
    // Timer state persistence
    timerState: varchar("timer_state").default("not-started"), // not-started, in-progress, paused, completed
    timerStartedAt: timestamp("timer_started_at"),
    timerElapsedSeconds: integer("timer_elapsed_seconds").default(0),
    lastActiveDate: date("last_active_date"), // to reset daily timers
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Task completions/entries table
export const taskEntries = pgTable("task_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskId: varchar("task_id").notNull().references(() => tasks.id),
    userId: varchar("user_id").notNull().references(() => users.id),
    date: date("date").notNull(),
    completed: boolean("completed").notNull().default(false),
    value: integer("value"), // for measurable tasks like steps
    duration: integer("duration"), // for timed tasks in seconds
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    // Unique constraint for taskId, userId, and date combination
    uniqueEntry: unique().on(table.taskId, table.userId, table.date),
}));

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    date: date("date").notNull(),
    content: text("content").notNull(),
    mood: integer("mood"), // 1-5 scale
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    // Unique constraint for userId and date combination
    uniqueEntry: unique().on(table.userId, table.date),
}));

// Shared tasks table for social features
export const sharedTasks = pgTable("shared_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskId: varchar("task_id").notNull().references(() => tasks.id),
    sharedBy: varchar("shared_by").notNull().references(() => users.id),
    sharedWith: varchar("shared_with").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    tasks: many(tasks),
    taskEntries: many(taskEntries),
    journalEntries: many(journalEntries),
    sharedTasksBy: many(sharedTasks, { relationName: "sharedBy" }),
    sharedTasksWith: many(sharedTasks, { relationName: "sharedWith" }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
    user: one(users, {
        fields: [tasks.userId],
        references: [users.id],
    }),
    entries: many(taskEntries),
    sharedTasks: many(sharedTasks),
}));

export const taskEntriesRelations = relations(taskEntries, ({ one }) => ({
    task: one(tasks, {
        fields: [taskEntries.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [taskEntries.userId],
        references: [users.id],
    }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
    user: one(users, {
        fields: [journalEntries.userId],
        references: [users.id],
    }),
}));

export const sharedTasksRelations = relations(sharedTasks, ({ one }) => ({
    task: one(tasks, {
        fields: [sharedTasks.taskId],
        references: [tasks.id],
    }),
    sharedByUser: one(users, {
        fields: [sharedTasks.sharedBy],
        references: [users.id],
        relationName: "sharedBy",
    }),
    sharedWithUser: one(users, {
        fields: [sharedTasks.sharedWith],
        references: [users.id],
        relationName: "sharedWith",
    }),
}));

// Schemas for validation
export const insertTaskSchema = createInsertSchema(tasks).omit({
    id: true,
    userId: true,
    currentStreak: true,
    bestStreak: true,
    totalCompletions: true,
    timerState: true,
    timerStartedAt: true,
    timerElapsedSeconds: true,
    lastActiveDate: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    isDayLongTask: z.boolean().optional(),
    selectedDays: z.string().optional(),
    type: z.string().optional(),
    goal: z.number().nullable().optional(),
    goalUnit: z.string().optional(),
    customDays: z.any().optional(),
    timesPerWeek: z.number().optional(),
    reminderTime: z.string().optional(),
    displayOrder: z.number().optional(),
});

export const insertTaskEntrySchema = createInsertSchema(taskEntries).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
    timerState: z.string().optional(),
    timerStartedAt: z.date().optional(),
    timerElapsedSeconds: z.number().optional(),
    lastActiveDate: z.string().optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type TaskEntry = typeof taskEntries.$inferSelect;
export type InsertTaskEntry = z.infer<typeof insertTaskEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type SharedTask = typeof sharedTasks.$inferSelect;
