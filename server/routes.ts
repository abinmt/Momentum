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
            // console.log("Creating task with data:", JSON.stringify(req.body, null, 2));
            const taskData = insertTaskSchema.parse(req.body);
            const task = await storage.createTask({ ...taskData, userId });
            res.status(201).json(task);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
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

    // Timer state routes
    app.patch('/api/tasks/:id/timer', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { id } = req.params;
            const { timerState, timerStartedAt, timerElapsedSeconds } = req.body;
            
            const today = new Date().toISOString().split('T')[0];
            const task = await storage.updateTask(id, userId, {
                timerState,
                timerStartedAt: timerStartedAt ? new Date(timerStartedAt) : undefined,
                timerElapsedSeconds,
                lastActiveDate: today,
            });
            
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json(task);
        } catch (error) {
            console.error("Error updating timer state:", error);
            res.status(500).json({ message: "Failed to update timer state" });
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

    app.get('/api/tasks/:taskId/entries/today', isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.user.claims.sub;
            const { taskId } = req.params;
            const today = new Date().toISOString().split('T')[0];
            const entry = await storage.getTaskEntry(taskId, userId, today);
            res.json(entry || { value: 0 });
        } catch (error) {
            console.error("Error fetching today's task entry:", error);
            res.status(500).json({ message: "Failed to fetch today's task entry" });
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

    // Push notification routes
    app.get('/api/notifications/vapid-key', (req, res) => {
        // In production, this should be a proper VAPID key pair
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BCryqjhOW2CxKARP-2MuXPvyj7EJ3FgdvAr1_Lev8OWKi16x8Zz_FZp8xJJHyy1YHxKNYrKnWJrWJsWCcj6M7cQ';
        res.json({ publicKey: vapidPublicKey });
    });

    app.post('/api/notifications/subscribe', isAuthenticated, async (req: any, res) => {
        try {
            const { subscription } = req.body;
            const userId = req.user?.claims?.sub;
            
            // Store subscription in database
            await storage.saveNotificationSubscription(userId, subscription);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error saving notification subscription:', error);
            res.status(500).json({ message: 'Failed to save subscription' });
        }
    });

    app.post('/api/notifications/unsubscribe', isAuthenticated, async (req: any, res) => {
        try {
            const { subscription } = req.body;
            const userId = req.user?.claims?.sub;
            
            // Remove subscription from database
            await storage.removeNotificationSubscription(userId, subscription);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error removing notification subscription:', error);
            res.status(500).json({ message: 'Failed to remove subscription' });
        }
    });

    app.post('/api/notifications/schedule', isAuthenticated, async (req: any, res) => {
        try {
            const { habitId, reminderTime, habitName, subscription } = req.body;
            const userId = req.user?.claims?.sub;
            
            // Schedule the notification (this would typically use a job queue)
            await scheduleHabitReminder(userId, habitId, reminderTime, habitName, subscription);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error scheduling notification:', error);
            res.status(500).json({ message: 'Failed to schedule notification' });
        }
    });

    app.post('/api/notifications/test', isAuthenticated, async (req: any, res) => {
        try {
            const { subscription } = req.body;
            
            await sendTestNotification(subscription);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error sending test notification:', error);
            res.status(500).json({ message: 'Failed to send test notification' });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}

// Push notification helper functions
async function scheduleHabitReminder(userId: string, habitId: string, reminderTime: string, habitName: string, subscription: any) {
    // In a production app, you'd use a job queue like Bull/Agenda
    // For now, we'll simulate scheduling
    console.log(`Scheduled reminder for habit "${habitName}" at ${reminderTime} for user ${userId}`);
    
    // Example: Schedule a test notification in 10 seconds
    setTimeout(async () => {
        try {
            await sendPushNotification(subscription, {
                title: `Time for ${habitName}! 🎯`,
                body: "Keep your momentum going - complete your habit now!",
                icon: '/icon-192x192.svg',
                data: { habitId, userId }
            });
        } catch (error) {
            console.error('Failed to send scheduled notification:', error);
        }
    }, 10000);
}

async function sendTestNotification(subscription: any) {
    const motivationalMessages = [
        "Great job staying consistent! 🌟",
        "You're building amazing habits! 💪",
        "Every small step counts towards your goals! 🎯",
        "Momentum is on your side - keep going! 🚀",
        "Your future self will thank you! ✨"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    return sendPushNotification(subscription, {
        title: "Momentum Test Notification",
        body: randomMessage,
        icon: '/icon-192x192.svg',
        data: { test: true }
    });
}

async function sendPushNotification(subscription: any, payload: any) {
    // In production, you'd use a proper push notification service like web-push
    // For demo purposes, we'll just log the notification
    console.log('Sending push notification:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        payload
    });
    
    // Simulate successful delivery
    return Promise.resolve();
}
