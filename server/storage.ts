import {
    users,
    tasks,
    taskEntries,
    journalEntries,
    sharedTasks,
    type User,
    type UpsertUser,
    type Task,
    type InsertTask,
    type UpdateTask,
    type TaskEntry,
    type InsertTaskEntry,
    type JournalEntry,
    type InsertJournalEntry,
    type SharedTask,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
    // User operations
    getUser(id: string): Promise<User | undefined>;
    upsertUser(user: UpsertUser): Promise<User>;
    updateUserSettings(id: string, settings: Partial<Pick<User, 'notificationsEnabled' | 'soundEnabled' | 'vibrationEnabled' | 'darkModeEnabled' | 'reminderTime'>>): Promise<User | undefined>;
    
    // Task operations
    getTasks(userId: string): Promise<Task[]>;
    getTask(id: string, userId: string): Promise<Task | undefined>;
    createTask(task: InsertTask & { userId: string }): Promise<Task>;
    updateTask(id: string, userId: string, updates: UpdateTask): Promise<Task | undefined>;
    deleteTask(id: string, userId: string): Promise<boolean>;
    reorderTasks(userId: string, draggedTaskId: string, targetTaskId: string): Promise<void>;
    
    // Task entry operations
    getTaskEntries(taskId: string, userId: string, startDate?: string, endDate?: string): Promise<TaskEntry[]>;
    getTaskEntry(taskId: string, userId: string, date: string): Promise<TaskEntry | undefined>;
    createOrUpdateTaskEntry(entry: InsertTaskEntry & { userId: string }): Promise<TaskEntry>;
    
    // Journal operations
    getJournalEntries(userId: string, startDate?: string, endDate?: string): Promise<JournalEntry[]>;
    getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined>;
    createOrUpdateJournalEntry(entry: InsertJournalEntry & { userId: string }): Promise<JournalEntry>;
    
    // Statistics operations
    getUserStatistics(userId: string): Promise<{
        totalTasks: number;
        totalCompletions: number;
        bestStreak: number;
        currentActiveStreaks: number;
        completionRate: number;
    }>;
    
    // Shared tasks operations
    shareTask(taskId: string, sharedBy: string, sharedWith: string): Promise<SharedTask>;
    getSharedTasks(userId: string): Promise<SharedTask[]>;
}

export class DatabaseStorage implements IStorage {
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async upsertUser(userData: UpsertUser): Promise<User> {
        const [user] = await db
            .insert(users)
            .values(userData)
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    ...userData,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return user;
    }

    async updateUserSettings(id: string, settings: Partial<Pick<User, 'notificationsEnabled' | 'soundEnabled' | 'vibrationEnabled' | 'darkModeEnabled' | 'reminderTime'>>): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({
                ...settings,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async getTasks(userId: string): Promise<Task[]> {
        return await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, userId), eq(tasks.isActive, true)))
            .orderBy(asc(tasks.displayOrder), asc(tasks.createdAt));
    }

    async getTask(id: string, userId: string): Promise<Task | undefined> {
        const [task] = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
        return task;
    }

    async createTask(taskData: InsertTask & { userId: string }): Promise<Task> {
        const [task] = await db
            .insert(tasks)
            .values(taskData)
            .returning();
        return task;
    }

    async updateTask(id: string, userId: string, updates: UpdateTask): Promise<Task | undefined> {
        const [task] = await db
            .update(tasks)
            .set({ ...updates, updatedAt: new Date() })
            .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
            .returning();
        return task;
    }

    async deleteTask(id: string, userId: string): Promise<boolean> {
        const result = await db
            .update(tasks)
            .set({ isActive: false, updatedAt: new Date() })
            .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
            .returning();
        return result.length > 0;
    }

    async getTaskEntries(taskId: string, userId: string, startDate?: string, endDate?: string): Promise<TaskEntry[]> {
        let conditions = [
            eq(taskEntries.taskId, taskId),
            eq(taskEntries.userId, userId)
        ];

        if (startDate) {
            conditions.push(gte(taskEntries.date, startDate));
        }
        if (endDate) {
            conditions.push(lte(taskEntries.date, endDate));
        }

        return await db
            .select()
            .from(taskEntries)
            .where(and(...conditions))
            .orderBy(desc(taskEntries.date));
    }

    async getTaskEntry(taskId: string, userId: string, date: string): Promise<TaskEntry | undefined> {
        const [entry] = await db
            .select()
            .from(taskEntries)
            .where(and(
                eq(taskEntries.taskId, taskId),
                eq(taskEntries.userId, userId),
                eq(taskEntries.date, date)
            ));
        return entry;
    }

    async createOrUpdateTaskEntry(entryData: InsertTaskEntry & { userId: string }): Promise<TaskEntry> {
        const [entry] = await db
            .insert(taskEntries)
            .values(entryData)
            .onConflictDoUpdate({
                target: [taskEntries.taskId, taskEntries.userId, taskEntries.date],
                set: {
                    ...entryData,
                    updatedAt: new Date(),
                },
            })
            .returning();
        
        // Update task streaks if entry is completed
        if (entryData.completed) {
            await this.updateTaskStreaks(entryData.taskId, entryData.userId);
        }
        
        return entry;
    }

    async getJournalEntries(userId: string, startDate?: string, endDate?: string): Promise<JournalEntry[]> {
        let conditions = [eq(journalEntries.userId, userId)];

        if (startDate) {
            conditions.push(gte(journalEntries.date, startDate));
        }
        if (endDate) {
            conditions.push(lte(journalEntries.date, endDate));
        }

        return await db
            .select()
            .from(journalEntries)
            .where(and(...conditions))
            .orderBy(desc(journalEntries.date));
    }

    async getJournalEntry(userId: string, date: string): Promise<JournalEntry | undefined> {
        const [entry] = await db
            .select()
            .from(journalEntries)
            .where(and(
                eq(journalEntries.userId, userId),
                eq(journalEntries.date, date)
            ));
        return entry;
    }

    async createOrUpdateJournalEntry(entryData: InsertJournalEntry & { userId: string }): Promise<JournalEntry> {
        const [entry] = await db
            .insert(journalEntries)
            .values(entryData)
            .onConflictDoUpdate({
                target: [journalEntries.userId, journalEntries.date],
                set: {
                    ...entryData,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return entry;
    }

    async getUserStatistics(userId: string): Promise<{
        totalTasks: number;
        totalCompletions: number;
        bestStreak: number;
        currentActiveStreaks: number;
        completionRate: number;
    }> {
        const userTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, userId), eq(tasks.isActive, true)));

        const totalTasks = userTasks.length;
        const totalCompletions = userTasks.reduce((sum, task) => sum + task.totalCompletions, 0);
        const bestStreak = Math.max(...userTasks.map(task => task.bestStreak), 0);
        const currentActiveStreaks = userTasks.filter(task => task.currentStreak > 0).length;

        // Calculate completion rate for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentEntries = await db
            .select()
            .from(taskEntries)
            .where(and(
                eq(taskEntries.userId, userId),
                gte(taskEntries.date, thirtyDaysAgo.toISOString().split('T')[0])
            ));

        const completedEntries = recentEntries.filter(entry => entry.completed).length;
        const completionRate = recentEntries.length > 0 ? (completedEntries / recentEntries.length) * 100 : 0;

        return {
            totalTasks,
            totalCompletions,
            bestStreak,
            currentActiveStreaks,
            completionRate: Math.round(completionRate * 10) / 10,
        };
    }

    async shareTask(taskId: string, sharedBy: string, sharedWith: string): Promise<SharedTask> {
        const [sharedTask] = await db
            .insert(sharedTasks)
            .values({ taskId, sharedBy, sharedWith })
            .returning();
        return sharedTask;
    }

    async reorderTasks(userId: string, draggedTaskId: string, targetTaskId: string): Promise<void> {
        // Get all user tasks sorted by display order
        const userTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, userId), eq(tasks.isActive, true)))
            .orderBy(asc(tasks.displayOrder), asc(tasks.createdAt));

        // Find current positions
        const draggedIndex = userTasks.findIndex(task => task.id === draggedTaskId);
        const targetIndex = userTasks.findIndex(task => task.id === targetTaskId);

        if (draggedIndex === -1 || targetIndex === -1) {
            throw new Error("Task not found");
        }

        // Remove the dragged task and insert it at the target position
        const draggedTask = userTasks[draggedIndex];
        userTasks.splice(draggedIndex, 1);
        userTasks.splice(targetIndex, 0, draggedTask);

        // Update display order for all tasks
        const updatePromises = userTasks.map((task, index) =>
            db.update(tasks)
                .set({ displayOrder: index, updatedAt: new Date() })
                .where(eq(tasks.id, task.id))
        );

        await Promise.all(updatePromises);
    }

    async getSharedTasks(userId: string): Promise<SharedTask[]> {
        return await db
            .select()
            .from(sharedTasks)
            .where(eq(sharedTasks.sharedWith, userId))
            .orderBy(desc(sharedTasks.createdAt));
    }

    private async updateTaskStreaks(taskId: string, userId: string): Promise<void> {
        // Get task entries for streak calculation
        const entries = await db
            .select()
            .from(taskEntries)
            .where(and(eq(taskEntries.taskId, taskId), eq(taskEntries.userId, userId)))
            .orderBy(desc(taskEntries.date));

        if (entries.length === 0) return;

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (const entry of entries) {
            const entryDate = new Date(entry.date);
            const dayDiff = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (dayDiff > currentStreak) break;
            if (entry.completed && dayDiff === currentStreak) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Calculate best streak
        let bestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;

        for (const entry of entries.reverse()) {
            const entryDate = new Date(entry.date);
            
            if (entry.completed) {
                if (lastDate && Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
                bestStreak = Math.max(bestStreak, tempStreak);
                lastDate = entryDate;
            } else {
                tempStreak = 0;
                lastDate = null;
            }
        }

        // Update total completions
        const totalCompletions = entries.filter(entry => entry.completed).length;

        // Update task with new stats
        await db
            .update(tasks)
            .set({
                currentStreak,
                bestStreak,
                totalCompletions,
                updatedAt: new Date(),
            })
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }
}

export const storage = new DatabaseStorage();
