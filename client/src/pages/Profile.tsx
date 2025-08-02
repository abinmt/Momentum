import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, Share2, Download, Bell } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function Profile() {
    const { user, isLoading } = useAuth() as { user: User | null, isLoading: boolean };
    const { toast } = useToast();

    const handleShareApp = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Stride - Habit Tracker',
                text: 'Check out Stride, the best habit tracking app to build better habits!',
                url: window.location.origin,
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.origin).then(() => {
                toast({
                    title: "Link copied!",
                    description: "App link copied to clipboard. Share it with friends!",
                });
            });
        }
    };

    const handleExportData = async () => {
        try {
            const response = await fetch('/api/export/data', {
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Export failed');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stride-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast({
                title: "Data exported",
                description: "Your habit data has been downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to export data. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    const initials = user?.firstName && user?.lastName 
        ? `${user.firstName[0]}${user.lastName[0]}` 
        : user?.email?.[0]?.toUpperCase() || 'U';

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
                    {/* Profile Header */}
                    <Card className="bg-white bg-opacity-20 backdrop-blur-sm border-none text-white mb-6">
                        <CardContent className="p-6 text-center">
                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                                <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold mb-1">
                                {user?.firstName && user?.lastName 
                                    ? `${user.firstName} ${user.lastName}` 
                                    : 'User'}
                            </h2>
                            <p className="text-white opacity-80">{user?.email}</p>
                        </CardContent>
                    </Card>

                    {/* Profile Options */}
                    <div className="space-y-3">
                        <Link href="/settings">
                            <Card className="bg-white bg-opacity-20 backdrop-blur-sm border-none cursor-pointer hover:bg-opacity-30 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center space-x-3">
                                            <Settings className="w-5 h-5" />
                                            <span>App Settings</span>
                                        </div>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/settings">
                            <Card className="bg-white bg-opacity-20 backdrop-blur-sm border-none cursor-pointer hover:bg-opacity-30 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center space-x-3">
                                            <Bell className="w-5 h-5" />
                                            <span>Notifications</span>
                                        </div>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Card 
                            className="bg-white bg-opacity-20 backdrop-blur-sm border-none cursor-pointer hover:bg-opacity-30 transition-all"
                            onClick={handleShareApp}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-3">
                                        <Share2 className="w-5 h-5" />
                                        <span>Share App</span>
                                    </div>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card 
                            className="bg-white bg-opacity-20 backdrop-blur-sm border-none cursor-pointer hover:bg-opacity-30 transition-all"
                            onClick={handleExportData}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-3">
                                        <Download className="w-5 h-5" />
                                        <span>Export Data</span>
                                    </div>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Logout Button */}
                    <Button 
                        className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white border-none py-4"
                        onClick={() => window.location.href = '/api/logout'}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Sign Out
                    </Button>
                </main>

                <BottomNavigation activeTab="profile" />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Info */}
                        <Card className="md:col-span-1 bg-white bg-opacity-20 backdrop-blur-sm border-none text-white">
                            <CardContent className="p-6 text-center">
                                <Avatar className="w-32 h-32 mx-auto mb-4">
                                    <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                                    <AvatarFallback className="bg-white text-primary text-3xl font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-2xl font-bold mb-2">
                                    {user?.firstName && user?.lastName 
                                        ? `${user.firstName} ${user.lastName}` 
                                        : 'User'}
                                </h2>
                                <p className="text-white opacity-80 mb-4">{user?.email}</p>
                                <Button 
                                    className="w-full bg-red-500 hover:bg-red-600 text-white border-none"
                                    onClick={() => window.location.href = '/api/logout'}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card className="md:col-span-2 bg-white bg-opacity-20 backdrop-blur-sm border-none text-white">
                            <CardHeader>
                                <CardTitle className="text-white">Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link href="/settings">
                                        <Card className="bg-white bg-opacity-10 border-none cursor-pointer hover:bg-opacity-20 transition-all">
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3 text-white">
                                                    <Settings className="w-6 h-6" />
                                                    <div>
                                                        <h3 className="font-semibold">App Settings</h3>
                                                        <p className="text-sm opacity-80">Customize your experience</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/settings">
                                        <Card className="bg-white bg-opacity-10 border-none cursor-pointer hover:bg-opacity-20 transition-all">
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3 text-white">
                                                    <Bell className="w-6 h-6" />
                                                    <div>
                                                        <h3 className="font-semibold">Notifications</h3>
                                                        <p className="text-sm opacity-80">Manage reminders</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Card 
                                        className="bg-white bg-opacity-10 border-none cursor-pointer hover:bg-opacity-20 transition-all"
                                        onClick={handleShareApp}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3 text-white">
                                                <Share2 className="w-6 h-6" />
                                                <div>
                                                    <h3 className="font-semibold">Share App</h3>
                                                    <p className="text-sm opacity-80">Tell others about Stride</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card 
                                        className="bg-white bg-opacity-10 border-none cursor-pointer hover:bg-opacity-20 transition-all"
                                        onClick={handleExportData}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center space-x-3 text-white">
                                                <Download className="w-6 h-6" />
                                                <div>
                                                    <h3 className="font-semibold">Export Data</h3>
                                                    <p className="text-sm opacity-80">Download your progress</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}