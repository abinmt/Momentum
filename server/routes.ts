import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertTaskEntrySchema, insertJournalEntrySchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
    // Auth middleware
    await setupAuth(app);

    // Auth routes
    app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const user = await storage.getUser(userId);
            res.json(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });

    // User settings routes
    app.patch('/api/user/settings', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const settings = req.body;
            
            const updatedUser = await storage.updateUserSettings(userId, settings);
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(updatedUser);
        } catch (error) {
            console.error("Error updating user settings:", error);
            res.status(500).json({ message: "Failed to update settings" });
        }
    });

    // Task routes
    app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const tasks = await storage.getTasks(userId);
            res.json(tasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            res.status(500).json({ message: "Failed to fetch tasks" });
        }
    });

    // Reorder tasks
    app.put('/api/tasks/reorder', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { draggedTaskId, targetTaskId } = req.body;
            
            if (!draggedTaskId || !targetTaskId) {
                return res.status(400).json({ message: "Both draggedTaskId and targetTaskId are required" });
            }

            await storage.reorderTasks(userId, draggedTaskId, targetTaskId);
            res.json({ message: "Tasks reordered successfully" });
        } catch (error) {
            console.error("Error reordering tasks:", error);
            res.status(500).json({ message: "Failed to reorder tasks" });
        }
    });

    app.get('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { id } = req.params;
            const task = await storage.getTask(id, userId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            console.error("Error fetching task:", error);
            res.status(500).json({ message: "Failed to fetch task" });
        }
    });

    app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const taskData = insertTaskSchema.parse(req.body);
            const task = await storage.createTask({ ...taskData, userId });
            res.status(201).json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid task data", errors: error.errors });
            }
            console.error("Error creating task:", error);
            res.status(500).json({ message: "Failed to create task" });
        }
    });

    app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { id } = req.params;
            const updates = updateTaskSchema.parse(req.body);
            const task = await storage.updateTask(id, userId, updates);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid update data", errors: error.errors });
            }
            console.error("Error updating task:", error);
            res.status(500).json({ message: "Failed to update task" });
        }
    });

    app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { id } = req.params;
            const success = await storage.deleteTask(id, userId);
            if (!success) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json({ message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error deleting task:", error);
            res.status(500).json({ message: "Failed to delete task" });
        }
    });

    // Task entry routes
    app.get('/api/tasks/:taskId/entries', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { taskId } = req.params;
            const { startDate, endDate } = req.query;
            const entries = await storage.getTaskEntries(taskId, userId, startDate, endDate);
            res.json(entries);
        } catch (error) {
            console.error("Error fetching task entries:", error);
            res.status(500).json({ message: "Failed to fetch task entries" });
        }
    });

    app.post('/api/tasks/:taskId/entries', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { taskId } = req.params;
            const entryData = insertTaskEntrySchema.parse({ ...req.body, taskId });
            const entry = await storage.createOrUpdateTaskEntry({ ...entryData, userId });
            res.json(entry);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
            }
            console.error("Error creating task entry:", error);
            res.status(500).json({ message: "Failed to create task entry" });
        }
    });

    // Journal routes
    app.get('/api/journal', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { startDate, endDate } = req.query;
            const entries = await storage.getJournalEntries(userId, startDate, endDate);
            res.json(entries);
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            res.status(500).json({ message: "Failed to fetch journal entries" });
        }
    });

    app.get('/api/journal/:date', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { date } = req.params;
            const entry = await storage.getJournalEntry(userId, date);
            res.json(entry || null);
        } catch (error) {
            console.error("Error fetching journal entry:", error);
            res.status(500).json({ message: "Failed to fetch journal entry" });
        }
    });

    app.post('/api/journal', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const entryData = insertJournalEntrySchema.parse(req.body);
            const entry = await storage.createOrUpdateJournalEntry({ ...entryData, userId });
            res.json(entry);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid entry data", errors: error.errors });
            }
            console.error("Error creating journal entry:", error);
            res.status(500).json({ message: "Failed to create journal entry" });
        }
    });

    // Statistics routes
    app.get('/api/statistics', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const stats = await storage.getUserStatistics(userId);
            res.json(stats);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            res.status(500).json({ message: "Failed to fetch statistics" });
        }
    });

    // Shared tasks routes
    app.post('/api/tasks/:taskId/share', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { taskId } = req.params;
            const { sharedWith } = req.body;
            
            if (!sharedWith) {
                return res.status(400).json({ message: "sharedWith is required" });
            }

            const sharedTask = await storage.shareTask(taskId, userId, sharedWith);
            res.status(201).json(sharedTask);
        } catch (error) {
            console.error("Error sharing task:", error);
            res.status(500).json({ message: "Failed to share task" });
        }
    });

    app.get('/api/shared-tasks', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const sharedTasks = await storage.getSharedTasks(userId);
            res.json(sharedTasks);
        } catch (error) {
            console.error("Error fetching shared tasks:", error);
            res.status(500).json({ message: "Failed to fetch shared tasks" });
        }
    });

    // Data export endpoint
    app.get('/api/export/data', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            
            // Get all user data
            const user = await storage.getUser(userId);
            const tasks = await storage.getTasks(userId);
            const stats = await storage.getUserStatistics(userId);
            
            // Get recent journal entries (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const journalEntries = await storage.getJournalEntries(userId, thirtyDaysAgo.toISOString().split('T')[0]);
            
            // Create export data
            const exportData = {
                user: {
                    email: user?.email,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    settings: {
                        notificationsEnabled: user?.notificationsEnabled,
                        soundEnabled: user?.soundEnabled,
                        vibrationEnabled: user?.vibrationEnabled,
                        darkModeEnabled: user?.darkModeEnabled,
                        reminderTime: user?.reminderTime,
                    }
                },
                tasks: tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    icon: task.icon,
                    color: task.color,
                    type: task.type,
                    currentStreak: task.currentStreak,
                    bestStreak: task.bestStreak,
                    totalCompletions: task.totalCompletions,
                    createdAt: task.createdAt,
                })),
                statistics: stats,
                journalEntries: journalEntries.map(entry => ({
                    date: entry.date,
                    content: entry.content,
                    mood: entry.mood,
                })),
                exportDate: new Date().toISOString(),
                appVersion: '1.0.0'
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="stride-data-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(exportData);
        } catch (error) {
            console.error("Error exporting data:", error);
            res.status(500).json({ message: "Failed to export data" });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
