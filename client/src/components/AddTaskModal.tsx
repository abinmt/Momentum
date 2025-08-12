import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TaskConfigModal from "./TaskConfigModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createTaskMutation = useMutation({
        mutationFn: async (taskData: any) => {
            return await apiRequest("POST", "/api/tasks", taskData);
        },
        onSuccess: () => {
            // Visual feedback through UI state change is sufficient
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            onClose();
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

    return (
        <TaskConfigModal
            isOpen={isOpen}
            onClose={onClose}
            task={null} // Start with blank task for custom creation
            onSave={handleTaskSave}
        />
    );
}
