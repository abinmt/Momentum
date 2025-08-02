import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";

interface Statistics {
    totalTasks: number;
    totalCompletions: number;
    bestStreak: number;
    currentActiveStreaks: number;
    completionRate: number;
}

export default function Statistics() {
    const { data: stats, isLoading } = useQuery<Statistics>({
        queryKey: ["/api/statistics"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative max-w-md mx-auto">
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
                <div className="mb-6">
                    <Button className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold border-none hover:opacity-90">
                        ALL TIME
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-dark mb-2">{stats?.bestStreak || 0}</div>
                        <div className="text-sm text-gray-600">BEST STREAK</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-dark mb-2">{stats?.completionRate || 0}%</div>
                        <div className="text-sm text-gray-600">ALL TIME</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-dark mb-2">{stats?.totalCompletions || 0}</div>
                        <div className="text-sm text-gray-600">COMPLETIONS</div>
                    </div>
                </div>

                {/* Progress Chart Placeholder */}
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl p-4 mb-8">
                    <svg className="w-full h-24" viewBox="0 0 300 80">
                        <polyline 
                            fill="none" 
                            stroke="#FF1B6B" 
                            strokeWidth="3" 
                            points="0,60 50,45 100,55 150,40 200,50 250,35 300,30" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>30 DAYS AGO</span>
                        <span>PROGRESS</span>
                        <span>TODAY</span>
                    </div>
                </div>

                {/* Weekly Stats */}
                <div className="mb-8">
                    <div className="text-sm text-gray-600 mb-4">WEEKLY COMPLETIONS</div>
                    <div className="flex items-end justify-between space-x-2 h-24">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <div key={day} className="flex flex-col items-center">
                                <div 
                                    className="w-6 bg-gradient-primary rounded-t" 
                                    style={{ height: `${60 + Math.random() * 40}px` }}
                                ></div>
                                <span className="text-xs text-gray-600 mt-2">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-dark mb-1">{stats?.totalTasks || 0}</div>
                        <div className="text-sm text-gray-600">ACTIVE TASKS</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-dark mb-1">{stats?.currentActiveStreaks || 0}</div>
                        <div className="text-sm text-gray-600">ACTIVE STREAKS</div>
                    </div>
                </div>
            </main>

            <BottomNavigation activeTab="statistics" />
        </div>
    );
}
