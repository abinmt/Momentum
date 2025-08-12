import { useLocation } from "wouter";
import { Grid3X3, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
    activeTab: "tasks" | "profile";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
    const [, setLocation] = useLocation();

    const tabs = [
        { id: "tasks", icon: Grid3X3, label: "Habits", path: "/" },
        { id: "profile", icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/10 border-t border-white/20 backdrop-blur-lg theme-transition">
            <div className="flex justify-around py-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            className={`flex flex-col items-center py-2 px-4 theme-transition ${
                                isActive ? "text-white" : "text-white/60"
                            } hover:text-white`}
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
