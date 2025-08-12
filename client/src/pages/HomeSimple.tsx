import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useSensors, useSensor, PointerSensor, KeyboardSensor, DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";

import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import InstallPrompt from "@/components/InstallPrompt";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
    const { user } = useAuth();
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

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
            <Header 
                title="Your Habits"
                onAddHabit={() => setIsAddTaskModalOpen(true)}
                showAddButton={true}
            />
            
            {/* Main Content */}
            <main className="p-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedTasks?.map((task) => (
                                    <TaskCard 
                                        key={task.id} 
                                        task={task}
                                    />
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
            </main>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />
            
            <InstallPrompt />
        </div>
    );
}