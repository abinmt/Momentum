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
import type { Task } from "@shared/schema";

interface TaskCardProps {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

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
        // Allow all tasks to be completed when clicking the card
        toggleMutation.mutate();
    };

    const handleStartPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsTimerRunning(!isTimerRunning);
        if (task.type === "timed") {
            // For timed tasks, this would start/stop the timer
            toast({
                title: isTimerRunning ? "Timer Paused" : "Timer Started",
                description: `${task.title} timer ${isTimerRunning ? "paused" : "started"}.`,
            });
        } else {
            // For other tasks, this could mark as in-progress
            toast({
                title: isTimerRunning ? "Task Paused" : "Task Started",
                description: `${task.title} ${isTimerRunning ? "paused" : "started"}.`,
            });
        }
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

    return (
        <div 
            className={`task-card ${colorClasses.bg} backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-white cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden`}
            onClick={handleCardClick}
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
                    {task.currentStreak > 0 ? `${task.currentStreak} day streak` : "Not started"}
                </div>
            </div>

            {/* Hamburger Menu */}
            <div className="absolute top-2 right-2">
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
                    <DropdownMenuContent className="bg-white text-black min-w-[150px]" align="end">
                        <DropdownMenuItem 
                            onClick={handleStartPause}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            {isTimerRunning ? (
                                <>
                                    <Pause className="w-4 h-4" />
                                    Pause Task
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
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
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
