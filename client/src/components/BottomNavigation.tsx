import { useLocation } from "wouter";
import { Grid3X3, BarChart3, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
    activeTab: "tasks" | "statistics" | "journal" | "profile";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
    const [, setLocation] = useLocation();

    const tabs = [
        { id: "tasks", icon: Grid3X3, label: "Tasks", path: "/" },
        { id: "statistics", icon: BarChart3, label: "Stats", path: "/statistics" },
        { id: "journal", icon: BookOpen, label: "Journal", path: "/journal" },
        { id: "profile", icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg bg-opacity-95">
            <div className="flex justify-around py-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            className={`flex flex-col items-center py-2 px-4 ${
                                isActive ? "text-primary" : "text-gray-400"
                            } hover:text-primary`}
                            onClick={() => setLocation(tab.path)}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}
