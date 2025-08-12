import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Trash2, Eye, Edit, MoreVertical } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TASK_ICONS, TASK_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from "@shared/schema";
import TaskConfigModal from "./TaskConfigModal";

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
    const [showDropdown, setShowDropdown] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

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
            // Visual feedback through UI animation is sufficient
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
            // Visual removal from UI provides sufficient feedback
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

    const updateTaskMutation = useMutation({
        mutationFn: async (updatedTask: any) => {
            return await apiRequest("PATCH", `/api/tasks/${task.id}`, updatedTask);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update habit.",
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
            // Don't show toast - user might just be viewing the card
            return;
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
            // No notification needed - the visual state change is sufficient
        } else if (taskState === 'in-progress') {
            newState = 'paused';
            newTimerStarted = null;
            setIsTimerRunning(false);
            // Visual state change provides sufficient feedback
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

    // Handle both icon keys and emoji icons
    const getIconDisplay = (iconName: string): string => {
        const iconMap: { [key: string]: string } = {
            // Basic icons
            'check': '✓', 'heart': '♥', 'star': '★', 'target': '●', 'zap': '⚡', 'book': '📚',
            'dumbbell': '🏋️', 'apple': '🍎', 'moon': '🌙', 'sun': '☀️', 'coffee': '☕', 'music': '🎵',
            // Exercise & Fitness
            'running': '🏃', 'swimming': '🏊', 'climbing': '🧗', 'stairs': '🪜', 'trekking': '🥾', 
            'walk': '🚶', 'bike': '🚴', 'yoga': '🧘', 'stretch': '🤸', 'pushup': '💪', 'pullup': '🏋️‍♂️',
            // Learning & Productivity
            'coding': '💻', 'learning': '🎓', 'writing': '✍️', 'painting': '🎨', 'study': '📖',
            'guitar': '🎸', 'piano': '🎹', 'journal': '📝',
            // Health & Wellness
            'meditation': '🧘‍♀️', 'water': '💧', 'sleep': '😴', 'pill': '💊', 'brush': '🪥', 
            'shower': '🚿', 'floss': '🦷', 'breathe': '💨', 'pray': '🙏',
            // Social & Communication
            'call': '📞', 'email': '📧', 'dance': '💃', 'sing': '🎤',
            // Daily Activities
            'clean': '🧹', 'cook': '👨‍🍳', 'garden': '🌱', 'photo': '📸'
        };
        return iconMap[iconName] || iconName || '✓';
    };
    
    const colorClasses = TASK_COLORS[task.color as keyof typeof TASK_COLORS] || TASK_COLORS.primary;
    
    // Apply grey overlay for paused/not started tasks
    const isInactive = taskState === 'not-started' || taskState === 'paused';
    const cardClasses = `task-card group ${colorClasses.bg} backdrop-blur-sm rounded-3xl p-8 md:p-6 flex flex-col items-center text-white cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden ${isInactive ? 'opacity-60 saturate-50' : ''} ${isDragging ? 'opacity-50 scale-105 rotate-2 z-50' : ''}`;

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={cardClasses}
            onClick={handleCardClick}
            {...attributes}
            {...listeners}
        >
            <div className="relative w-36 h-36 md:w-20 md:h-20 mb-6 md:mb-4">
                <div className="block md:hidden">
                    <ProgressRing
                        progress={getProgressPercentage()}
                        size={144}
                        strokeWidth={10}
                    />
                </div>
                <div className="hidden md:block">
                    <ProgressRing
                        progress={getProgressPercentage()}
                        size={80}
                        strokeWidth={6}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl md:text-2xl text-white leading-none">
                        {getIconDisplay(task.icon)}
                    </span>
                </div>
                {task.currentStreak > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-sm md:text-xs rounded-full w-8 h-8 md:w-5 md:h-5 flex items-center justify-center font-bold">
                        {task.currentStreak}
                    </div>
                )}
                {/* Goal display on bottom left */}
                {task.goal && (
                    <div className="absolute -bottom-2 -left-2 bg-black bg-opacity-50 text-white text-sm md:text-xs rounded-full px-3 py-1.5 md:px-2 md:py-1 font-semibold">
                        {task.goal}
                    </div>
                )}
            </div>
            
            <div className="text-center">
                <div className="text-base md:text-xs font-semibold mb-2 md:mb-1 line-clamp-2">
                    {task.title.toUpperCase()}
                </div>
                <div className="text-base md:text-xs opacity-80">
                    {taskState === 'completed' && task.currentStreak > 0 ? `${task.currentStreak} day streak` : 
                     taskState === 'in-progress' ? "In progress" :
                     taskState === 'paused' ? "Paused" : "Not started"}
                </div>
            </div>

            {/* Mobile: Hamburger Menu Only */}
            <div className="absolute top-2 right-2 z-10 md:hidden" ref={dropdownRef}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 w-8 h-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                    }}
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
                
                {showDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg rounded-md py-0 z-50 animate-in slide-in-from-top-2 duration-200 flex flex-col items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowViewModal(true);
                                setShowDropdown(false);
                            }}
                            className="flex items-center justify-center w-6 h-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded"
                            title="View Habit"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEditModal(true);
                                setShowDropdown(false);
                            }}
                            className="flex items-center justify-center w-6 h-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded"
                            title="Edit Habit"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                        <hr className="w-4 border-gray-200 dark:border-gray-700 my-0" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(e);
                                setShowDropdown(false);
                            }}
                            className="flex items-center justify-center w-6 h-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
                            title="Delete Habit"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Desktop: Individual Icons */}
            <div className="hidden md:block absolute top-1.5 right-1.5 z-10">
                <div className="flex flex-col space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-0.5 w-5 h-5"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowViewModal(true);
                        }}
                        title="View Habit"
                    >
                        <Eye className="w-2.5 h-2.5" />
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-0.5 w-5 h-5"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                        }}
                        title="Edit Habit"
                    >
                        <Edit className="w-2.5 h-2.5" />
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black bg-opacity-30 hover:bg-opacity-50 text-red-400 hover:text-red-300 rounded-full p-0.5 w-5 h-5"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e);
                        }}
                        title="Delete Habit"
                    >
                        <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                </div>
            </div>

            {/* View Habit Modal */}
            <TaskConfigModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                task={task}
                onSave={() => {}} // Read-only mode, no save needed
                readOnly={true}
            />

            {/* Edit Habit Modal */}
            <TaskConfigModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                task={task}
                onSave={(updatedTask: any) => {
                    // Handle updating the task
                    updateTaskMutation.mutate(updatedTask);
                    setShowEditModal(false);
                }}
                readOnly={false}
            />
        </div>
    );
}
