import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings, Star, Plus, User, ChevronDown } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import BottomNavigation from "@/components/BottomNavigation";
import AddTaskModal from "@/components/AddTaskModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Task } from "@shared/schema";

export default function Home() {
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const { user } = useAuth();

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
        <div className="min-h-screen bg-gradient-primary relative">
            {/* Mobile View */}
            <div className="block md:hidden max-w-md mx-auto">
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

                {/* Header with User Profile */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Your Habits</h2>
                    
                    {/* Mobile User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-white p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.profileImageUrl || undefined} />
                                    <AvatarFallback className="bg-white bg-opacity-20 text-white text-sm">
                                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-white" align="end">
                            <div className="px-3 py-2 border-b border-gray-700">
                                <div className="text-sm font-medium">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                </div>
                                <div className="text-xs opacity-70">{user?.email}</div>
                            </div>
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="cursor-pointer">
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => window.location.href = '/api/logout'}
                            >
                                <span className="w-4 h-4 mr-2">🚪</span>
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Page Indicators */}
                <div className="flex justify-center items-center mt-8">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                        <div className="w-2 h-2 bg-white opacity-60 rounded-full"></div>
                    </div>
                </div>
            </main>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />

                <BottomNavigation activeTab="tasks" />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Your Habits</h1>
                        <div className="flex items-center space-x-4">
                            <Button 
                                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                                onClick={() => setIsAddTaskModalOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Task
                            </Button>
                            
                            {/* User Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-xl"
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
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-white">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="cursor-pointer"
                                        onClick={() => window.location.href = '/api/logout'}
                                    >
                                        <span className="w-4 h-4 mr-2">🚪</span>
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {tasks?.map((task) => (
                            <div key={task.id} className="transform scale-110">
                                <TaskCard task={task} />
                            </div>
                        ))}
                        
                        {/* Add Task Card */}
                        <div 
                            className="task-card bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-white cursor-pointer hover:bg-opacity-30 transition-all duration-300 transform scale-110"
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
                </div>
            </div>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />
        </div>
    );
}
