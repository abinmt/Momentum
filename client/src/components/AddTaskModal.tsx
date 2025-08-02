import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Search, ChevronRight, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskConfigModal from "./TaskConfigModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HEALTH_TASKS } from "@/lib/constants";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createTaskMutation = useMutation({
        mutationFn: async (taskData: any) => {
            return await apiRequest("POST", "/api/tasks", taskData);
        },
        onSuccess: () => {
            toast({
                title: "Task Created",
                description: "Your new task has been created successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            onClose();
            setIsConfigModalOpen(false);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create task.",
                variant: "destructive",
            });
        },
    });

    const handleTaskSelect = (task: any) => {
        setSelectedTask(task);
        setIsConfigModalOpen(true);
    };

    const handleTaskSave = (taskConfig: any) => {
        createTaskMutation.mutate(taskConfig);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-dark text-white border-gray-700 max-w-md mx-auto md:max-w-2xl bottom-0 md:bottom-auto top-auto md:top-1/2 translate-y-0 md:-translate-y-1/2 rounded-t-3xl md:rounded-xl rounded-b-none md:rounded-b-xl">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6 text-white" />
                        </Button>
                        <DialogTitle className="text-xl font-bold">Add Task</DialogTitle>
                        <Button variant="ghost" size="icon">
                            <Search className="w-6 h-6 text-white" />
                        </Button>
                    </DialogHeader>

                    {/* Task Type Icons */}
                    <div className="flex justify-center space-x-4 mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-success rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM12 8a1 1 0 10-2 0v4a1 1 0 002 0V8z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                            </svg>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400 mb-4">
                        Health tasks are linked to the Health app and are automatically marked as complete when new data is recorded.
                    </div>

                    <div className="text-sm text-white font-semibold mb-4">CREATE A HEALTH TASK:</div>

                    {/* Health Tasks List */}
                    <ScrollArea className="max-h-96 md:max-h-[500px]">
                        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                            {HEALTH_TASKS.map((task) => (
                                <div 
                                    key={task.id}
                                    className="flex items-center justify-between py-3 md:py-4 border-b md:border border-gray-700 cursor-pointer hover:bg-gray-800 rounded px-2 md:px-4"
                                    onClick={() => handleTaskSelect(task)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-success rounded-full flex items-center justify-center">
                                            <task.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <span className="text-white md:text-lg">{task.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {task.hasHealthData && (
                                            <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                                        )}
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <TaskConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                task={selectedTask}
                onSave={handleTaskSave}
            />
        </>
    );
}
