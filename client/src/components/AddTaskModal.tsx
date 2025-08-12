import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TaskConfigModal from "./TaskConfigModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // When AddTaskModal opens, immediately open TaskConfigModal with blank task
    useEffect(() => {
        if (isOpen) {
            setIsConfigModalOpen(true);
        }
    }, [isOpen]);

    const createTaskMutation = useMutation({
        mutationFn: async (taskData: any) => {
            return await apiRequest("POST", "/api/tasks", taskData);
        },
        onSuccess: () => {
            // Visual feedback through UI state change is sufficient
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            onClose();
            setIsConfigModalOpen(false);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create habit.",
                variant: "destructive",
            });
        },
    });

    const handleTaskSave = (taskConfig: any) => {
        createTaskMutation.mutate(taskConfig);
    };

    const handleConfigClose = () => {
        setIsConfigModalOpen(false);
        onClose();
    };

    return (
        <TaskConfigModal
            isOpen={isConfigModalOpen}
            onClose={handleConfigClose}
            task={null} // Start with blank task for custom creation
            onSave={handleTaskSave}
        />
    );
}
