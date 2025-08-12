import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import type { JournalEntry } from "@shared/schema";

export default function Journal() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [content, setContent] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { theme } = useTheme();

    const dateString = currentDate.toISOString().split('T')[0];

    const { data: entry } = useQuery<JournalEntry | null>({
        queryKey: ["/api/journal", dateString],
    });

    const saveMutation = useMutation({
        mutationFn: async (data: { date: string; content: string }) => {
            return await apiRequest("POST", "/api/journal", data);
        },
        onSuccess: () => {
            // Auto-save - no notification needed
            queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save journal entry.",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        setContent(entry?.content || "");
    }, [entry]);

    const handleSave = () => {
        if (content.trim()) {
            saveMutation.mutate({
                date: dateString,
                content: content.trim(),
            });
        }
    };

    const previousDay = () => {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setCurrentDate(prevDate);
    };

    const nextDay = () => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setCurrentDate(nextDate);
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        if (isToday) {
            return "Today";
        }
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen relative transition-colors duration-300 ${
            isDark 
                ? "bg-gray-900 text-white" 
                : "bg-white text-gray-900"
        }`}>
            {/* Mobile View */}
            <div className="block md:hidden max-w-md mx-auto">
            {/* Main Content */}
            <main className="p-6 pb-24">
                <div className="flex items-center justify-between mb-8">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={previousDay}
                        className={`transition-colors duration-300 ${
                            isDark 
                                ? "text-white hover:bg-gray-700" 
                                : "text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">{formatDate(currentDate)}</h2>
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={nextDay}
                            className={`transition-colors duration-300 ${
                                isDark 
                                    ? "text-white hover:bg-gray-700" 
                                    : "text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className={`transition-colors duration-300 ${
                                isDark 
                                    ? "text-white hover:bg-gray-700" 
                                    : "text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <HelpCircle className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                <div className={`rounded-xl p-6 mb-6 transition-colors duration-300 ${
                    isDark 
                        ? "bg-gray-800 border border-gray-700" 
                        : "bg-gray-50 border border-gray-200"
                }`}>
                    <Textarea 
                        className={`w-full bg-transparent resize-none outline-none text-lg leading-relaxed border-none focus:ring-0 min-h-[200px] transition-colors duration-300 ${
                            isDark 
                                ? "text-white placeholder-white placeholder-opacity-60" 
                                : "text-gray-900 placeholder-gray-600"
                        }`}
                        placeholder="How was your day? Write about your progress..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <Button 
                    className="w-full bg-gradient-primary text-white border-none hover:opacity-90 py-6 text-lg font-semibold transition-all duration-300"
                    onClick={handleSave}
                    disabled={saveMutation.isPending || !content.trim()}
                >
                    {saveMutation.isPending ? "SAVING..." : "DONE"}
                </Button>
            </main>

                <BottomNavigation activeTab="journal" />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}>Journal</h1>
                        <div className="flex items-center space-x-4">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={previousDay}
                                className={`transition-colors duration-300 ${
                                    isDark 
                                        ? "text-white hover:bg-gray-700" 
                                        : "text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{formatDate(currentDate)}</h2>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={nextDay}
                                className={`transition-colors duration-300 ${
                                    isDark 
                                        ? "text-white hover:bg-gray-700" 
                                        : "text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className={`rounded-xl p-8 mb-6 transition-colors duration-300 ${
                                isDark 
                                    ? "bg-gray-800 border border-gray-700" 
                                    : "bg-gray-50 border border-gray-200"
                            }`}>
                                <Textarea 
                                    className={`w-full bg-transparent resize-none outline-none text-lg leading-relaxed border-none focus:ring-0 min-h-[400px] transition-colors duration-300 ${
                                        isDark 
                                            ? "text-white placeholder-white placeholder-opacity-60" 
                                            : "text-gray-900 placeholder-gray-600"
                                    }`}
                                    placeholder="How was your day? Write about your progress..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>

                            <Button 
                                className="w-full bg-gradient-primary text-white border-none hover:opacity-90 py-6 text-lg font-semibold transition-all duration-300"
                                onClick={handleSave}
                                disabled={saveMutation.isPending || !content.trim()}
                            >
                                {saveMutation.isPending ? "SAVING..." : "SAVE ENTRY"}
                            </Button>
                        </div>

                        <div className="lg:col-span-1">
                            <div className={`rounded-xl p-6 transition-colors duration-300 ${
                                isDark 
                                    ? "bg-gray-800 border border-gray-700" 
                                    : "bg-gray-50 border border-gray-200"
                            }`}>
                                <h3 className="text-lg font-semibold mb-4">Writing Tips</h3>
                                <ul className={`text-sm space-y-2 transition-colors duration-300 ${
                                    isDark ? "opacity-80" : "opacity-70"
                                }`}>
                                    <li>• Reflect on your habits progress</li>
                                    <li>• Note any challenges you faced</li>
                                    <li>• Celebrate your wins, big or small</li>
                                    <li>• Set intentions for tomorrow</li>
                                    <li>• Express gratitude</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
