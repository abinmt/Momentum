import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, Star, Plus, User, ChevronDown, Power } from "lucide-react";
import TaskCard from "@/components/TaskCard";

import AddTaskModal from "@/components/AddTaskModal";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import PWAStatusIndicator from "@/components/PWAStatusIndicator";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from "@shared/schema";

export default function Home() {
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [showMobileProfileDropdown, setShowMobileProfileDropdown] = useState(false);
    const [showDesktopProfileDropdown, setShowDesktopProfileDropdown] = useState(false);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
                setShowMobileProfileDropdown(false);
            }
            if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
                setShowDesktopProfileDropdown(false);
            }
        };

        if (showMobileProfileDropdown || showDesktopProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileProfileDropdown, showDesktopProfileDropdown]);

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ["/api/tasks"],
    });

    // Sort tasks by display order
    const sortedTasks = tasks?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Configure sensors for dnd-kit (works on both desktop and mobile)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Small threshold to distinguish from clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const reorderTasksMutation = useMutation({
        mutationFn: async ({ draggedTaskId, targetTaskId }: { draggedTaskId: string; targetTaskId: string }) => {
            return await apiRequest("PUT", "/api/tasks/reorder", {
                draggedTaskId,
                targetTaskId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            // Visual drag feedback provides sufficient confirmation
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to reorder tasks.",
                variant: "destructive",
            });
        },
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && sortedTasks) {
            const oldIndex = sortedTasks.findIndex((task) => task.id === active.id);
            const newIndex = sortedTasks.findIndex((task) => task.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const draggedTaskId = active.id as string;
                const targetTaskId = over?.id as string;
                
                reorderTasksMutation.mutate({
                    draggedTaskId,
                    targetTaskId,
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary relative theme-transition">
            {/* Mobile View */}
            <div className="block md:hidden max-w-md mx-auto">
                {/* Header with User Profile */}
                <div className="flex justify-between items-center mb-6 px-6 pt-6">
                    <h2 className="text-2xl font-bold text-white">Your Habits</h2>
                    
                    <div className="flex items-center space-x-3">
                        {/* Add Habit Button */}
                        <Button 
                            className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 px-4 py-2 text-sm"
                            onClick={() => setIsAddTaskModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Habit
                        </Button>
                        
                        {/* Mobile User Profile */}
                        <div className="relative" ref={mobileDropdownRef}>
                        <Button 
                            variant="ghost" 
                            className="text-white p-2"
                            onClick={() => setShowMobileProfileDropdown(!showMobileProfileDropdown)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.profileImageUrl || undefined} />
                                <AvatarFallback className="bg-white bg-opacity-20 text-white text-sm">
                                    {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                        
                        {showMobileProfileDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-medium">
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                    </div>
                                    <div className="text-xs opacity-70">{user?.email}</div>
                                </div>
                                <Link 
                                    href="/profile" 
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setShowMobileProfileDropdown(false)}
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <Link 
                                    href="/settings" 
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setShowMobileProfileDropdown(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => {
                                        window.location.href = '/api/logout';
                                        setShowMobileProfileDropdown(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Power className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="p-6 pb-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sortedTasks?.map(task => task.id) || []}
                            strategy={rectSortingStrategy}
                        >
                            {sortedTasks && sortedTasks.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8">
                                    {sortedTasks?.map((task) => (
                                        <TaskCard 
                                            key={task.id} 
                                            task={task}
                                        />
                                    ))}
                                </div>
                            ) : !isLoading ? (
                                <div className="text-center py-12 px-6">
                                    <div className="max-w-md mx-auto">
                                        <div className="text-6xl mb-6">🚀</div>
                                        <h3 className="text-xl font-bold text-white mb-4">Start Your Journey</h3>
                                        <p className="text-white opacity-80 mb-6 leading-relaxed">
                                            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                                        </p>
                                        <p className="text-sm text-white opacity-60 mb-8">
                                            Build lasting habits, track your progress, and create the momentum you need to achieve your goals.
                                        </p>
                                        <Button 
                                            className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 px-8 py-3 text-base font-semibold"
                                            onClick={() => setIsAddTaskModalOpen(true)}
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            Add Your First Habit
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </SortableContext>
                    </DndContext>
                </main>




            </div>

            {/* Desktop View */}
            <div className="hidden md:block container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Your Habits</h1>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Button 
                                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                                onClick={() => setIsAddTaskModalOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Habit
                            </Button>
                            
                            {/* Desktop User Profile Dropdown */}
                            <div className="relative" ref={desktopDropdownRef}>
                                <Button 
                                    variant="ghost" 
                                    className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-xl"
                                    onClick={() => setShowDesktopProfileDropdown(!showDesktopProfileDropdown)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.profileImageUrl || undefined} />
                                            <AvatarFallback className="bg-white bg-opacity-20 text-white text-sm">
                                                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left hidden lg:block">
                                            <div className="text-sm font-medium">
                                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                            </div>
                                            <div className="text-xs opacity-70">{user?.email}</div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 ml-2" />
                                    </div>
                                </Button>
                                
                                {showDesktopProfileDropdown && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                                        <Link 
                                            href="/profile" 
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setShowDesktopProfileDropdown(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Link>
                                        <Link 
                                            href="/settings" 
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => setShowDesktopProfileDropdown(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                window.location.href = '/api/logout';
                                                setShowDesktopProfileDropdown(false);
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Power className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Task Grid with DndContext */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sortedTasks?.map(task => task.id) || []}
                            strategy={rectSortingStrategy}
                        >
                            {sortedTasks && sortedTasks.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                                    {sortedTasks?.map((task) => (
                                        <div key={task.id} className="transform scale-110">
                                            <TaskCard task={task} />
                                        </div>
                                    ))}
                                </div>
                            ) : !isLoading ? (
                                <div className="text-center py-20 px-6">
                                    <div className="max-w-lg mx-auto">
                                        <div className="text-8xl mb-8">🚀</div>
                                        <h3 className="text-3xl font-bold text-white mb-6">Start Your Journey</h3>
                                        <p className="text-xl text-white opacity-80 mb-8 leading-relaxed">
                                            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                                        </p>
                                        <p className="text-base text-white opacity-60 mb-10 leading-relaxed">
                                            Build lasting habits, track your progress, and create the momentum you need to achieve your goals. 
                                            Every expert was once a beginner, and every streak starts with a single day.
                                        </p>
                                        <Button 
                                            className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 px-10 py-4 text-lg font-semibold"
                                            onClick={() => setIsAddTaskModalOpen(true)}
                                        >
                                            <Plus className="w-6 h-6 mr-3" />
                                            Add Your First Habit
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />
            
            <InstallPrompt />
            <OfflineIndicator />
            <PWAStatusIndicator compact={true} />
        </div>
    );
}