import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings, Star, Plus } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import BottomNavigation from "@/components/BottomNavigation";
import AddTaskModal from "@/components/AddTaskModal";
import { Button } from "@/components/ui/button";
import type { Task } from "@shared/schema";

export default function Home() {
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ["/api/tasks"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary relative max-w-md mx-auto">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 py-2 bg-gradient-primary text-white text-sm font-semibold">
                <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                <div className="flex items-center space-x-1">
                    <span className="text-xs">●●●●</span>
                    <span className="text-xs">5G</span>
                    <div className="w-6 h-3 border border-white rounded-sm">
                        <div className="w-4 h-1.5 bg-white rounded-sm mt-0.5 ml-0.5"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-6 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {tasks?.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    
                    {/* Add Task Card */}
                    <div 
                        className="task-card bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-white cursor-pointer hover:bg-opacity-30 transition-all duration-300"
                        onClick={() => setIsAddTaskModalOpen(true)}
                    >
                        <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                            <Plus className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-semibold mb-1">ADD A TASK</div>
                        </div>
                    </div>
                </div>

                {/* Settings and Star Icons */}
                <div className="flex justify-between items-center mt-8">
                    <Button variant="ghost" size="icon" className="text-white opacity-60 hover:opacity-100">
                        <Settings className="w-6 h-6" />
                    </Button>
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white opacity-60 hover:opacity-100">
                        <Star className="w-6 h-6" />
                    </Button>
                </div>
            </main>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />

            <BottomNavigation activeTab="tasks" />
        </div>
    );
}
