import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TASK_ICONS, TASK_COLORS } from "@/lib/constants";
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

    const handleCardClick = () => {
        if (task.type === "timed") {
            setIsTimerRunning(!isTimerRunning);
        } else {
            toggleMutation.mutate();
        }
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
            </div>
            
            <div className="text-center">
                <div className="text-xs font-semibold mb-1 line-clamp-2">
                    {task.title.toUpperCase()}
                </div>
                <div className="text-xs opacity-80">
                    {task.currentStreak > 0 ? `${task.currentStreak} day streak` : "Not started"}
                </div>
            </div>

            {task.type === "timed" && (
                <div className="absolute bottom-2 right-2">
                    <div className="bg-purple-600 rounded-full p-2">
                        {isTimerRunning ? (
                            <Pause className="w-4 h-4 text-white" />
                        ) : (
                            <Play className="w-4 h-4 text-white" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
