import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Trash2, MoreVertical } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TASK_ICONS, TASK_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from "@shared/schema";

interface TaskCardProps {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    // Initialize timer state from task data
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = task.lastActiveDate !== today;
    
    // Reset timer state if it's a new day
    const initialTimerState = isNewDay ? 'not-started' : (task.timerState || 'not-started');
    const initialElapsedSeconds = isNewDay ? 0 : (task.timerElapsedSeconds || 0);
    
    const [taskState, setTaskState] = useState<'not-started' | 'in-progress' | 'paused' | 'completed'>(
        initialTimerState as any
    );
    const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);
    const [isTimerRunning, setIsTimerRunning] = useState(initialTimerState === 'in-progress');

    // Timer update mutation
    const updateTimerMutation = useMutation({
        mutationFn: async (timerData: {
            timerState: string;
            timerStartedAt?: Date | null;
            timerElapsedSeconds: number;
        }) => {
            return await apiRequest("PATCH", `/api/tasks/${task.id}/timer`, timerData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save timer state.",
                variant: "destructive",
            });
        },
    });

    // Initialize sortable functionality
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const toggleMutation = useMutation({
        mutationFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            return await apiRequest("POST", `/api/tasks/${task.id}/entries`, {
                date: today,
                completed: true,
            });
        },
        onSuccess: () => {
            toast({
                title: "Great job!",
                description: `${task.title} completed for today.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update task progress.",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            return await apiRequest("DELETE", `/api/tasks/${task.id}`);
        },
        onSuccess: () => {
            toast({
                title: "Task deleted",
                description: `${task.title} has been removed.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete task.",
                variant: "destructive",
            });
        },
    });

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Only allow completion if task is in progress
        if (taskState === 'in-progress') {
            toggleMutation.mutate();
            setTaskState('completed');
            setIsTimerRunning(false);
            
            // Update database to mark as completed
            updateTimerMutation.mutate({
                timerState: 'completed',
                timerStartedAt: null,
                timerElapsedSeconds: elapsedSeconds,
            });
        } else if (taskState === 'not-started' || taskState === 'paused') {
            toast({
                title: "Task not started",
                description: "Please start the task first using the menu.",
                variant: "destructive",
            });
        }
    };

    const handleStartPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        let newState: 'not-started' | 'in-progress' | 'paused' | 'completed';
        let newTimerStarted: Date | null = null;
        
        if (taskState === 'not-started' || taskState === 'paused') {
            newState = 'in-progress';
            newTimerStarted = new Date();
            setIsTimerRunning(true);
            toast({
                title: "Task Started",
                description: `${task.title} is now active. Click the card to complete it.`,
            });
        } else if (taskState === 'in-progress') {
            newState = 'paused';
            newTimerStarted = null;
            setIsTimerRunning(false);
            toast({
                title: "Task Paused",
                description: `${task.title} has been paused.`,
            });
        } else {
            return; // No action for completed tasks
        }
        
        setTaskState(newState);
        
        // Update database with timer state
        updateTimerMutation.mutate({
            timerState: newState,
            timerStartedAt: newTimerStarted,
            timerElapsedSeconds: elapsedSeconds,
        });
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteMutation.mutate();
    };

    const getProgressPercentage = () => {
        // This is a simplified calculation - in a real app, you'd get this from task entries
        const today = new Date().toISOString().split('T')[0];
        // For demo purposes, showing random progress
        return Math.min(100, (task.currentStreak * 20) % 100);
    };

    const IconComponent = TASK_ICONS[task.icon as keyof typeof TASK_ICONS] || TASK_ICONS.check;
    const colorClasses = TASK_COLORS[task.color as keyof typeof TASK_COLORS] || TASK_COLORS.primary;
    
    // Apply grey overlay for paused/not started tasks
    const isInactive = taskState === 'not-started' || taskState === 'paused';
    const cardClasses = `task-card ${colorClasses.bg} backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-white cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden ${isInactive ? 'opacity-60 saturate-50' : ''} ${isDragging ? 'opacity-50 scale-105 rotate-2 z-50' : ''}`;

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={cardClasses}
            onClick={handleCardClick}
            {...attributes}
            {...listeners}
        >
            <div className="relative w-20 h-20 mb-4">
                <ProgressRing
                    progress={getProgressPercentage()}
                    size={80}
                    strokeWidth={6}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                </div>
                {task.currentStreak > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {task.currentStreak}
                    </div>
                )}
                {/* Goal display on bottom left */}
                {task.goal && (
                    <div className="absolute -bottom-2 -left-2 bg-black bg-opacity-50 text-white text-xs rounded-full px-2 py-1 font-semibold">
                        {task.goal}
                    </div>
                )}
            </div>
            
            <div className="text-center">
                <div className="text-xs font-semibold mb-1 line-clamp-2">
                    {task.title.toUpperCase()}
                </div>
                <div className="text-xs opacity-80">
                    {taskState === 'completed' && task.currentStreak > 0 ? `${task.currentStreak} day streak` : 
                     taskState === 'in-progress' ? "In progress" :
                     taskState === 'paused' ? "Paused" : "Not started"}
                </div>
            </div>

            {/* Hamburger Menu */}
            <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 w-8 h-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        className="bg-white dark:bg-gray-800 text-black dark:text-white min-w-[150px] border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
                        align="end"
                        sideOffset={5}
                        alignOffset={-5}
                    >
                        <DropdownMenuItem 
                            onClick={handleStartPause}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {taskState === 'not-started' ? (
                                <>
                                    <Play className="w-4 h-4" />
                                    Start Task
                                </>
                            ) : taskState === 'in-progress' ? (
                                <>
                                    <Pause className="w-4 h-4" />
                                    Pause Task
                                </>
                            ) : taskState === 'paused' ? (
                                <>
                                    <Play className="w-4 h-4" />
                                    Resume Task
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Start Task
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
