import { useState, useEffect } from "react";
import { ChevronLeft, Bell, Moon, Sun, Volume2, Vibrate, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";

export default function Settings() {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState([19]); // 7 PM default

    return (
        <div className="min-h-screen bg-gradient-primary">
            {/* Mobile View */}
            <div className={`${isMobile ? 'block' : 'hidden'} max-w-md mx-auto`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-white">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <div className="w-10"></div>
                </div>

                {/* Settings Content */}
                <div className="px-6 pb-24">
                    {/* Profile Section */}
                    <div className="bg-white bg-opacity-10 rounded-2xl p-4 mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                </h3>
                                <p className="text-sm text-white opacity-70">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-6">
                        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Bell className="w-5 h-5 mr-2" />
                                Notifications
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Push Notifications</span>
                                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Sound</span>
                                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Vibration</span>
                                    <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                                </div>
                                
                                <div className="space-y-2">
                                    <span className="text-white text-sm">Daily Reminder Time</span>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-white text-sm">6 AM</span>
                                        <Slider
                                            value={reminderTime}
                                            onValueChange={setReminderTime}
                                            max={23}
                                            min={6}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <span className="text-white text-sm">11 PM</span>
                                    </div>
                                    <p className="text-white text-xs opacity-70">
                                        Current: {reminderTime[0] === 12 ? '12 PM' : reminderTime[0] > 12 ? `${reminderTime[0] - 12} PM` : `${reminderTime[0]} AM`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                {darkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
                                Appearance
                            </h3>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-white">Dark Mode</span>
                                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                            
                            <div className="space-y-3">
                                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white hover:bg-opacity-10">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </Button>
                                
                                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white hover:bg-opacity-10">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Data
                                </Button>
                                
                                <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500 hover:bg-opacity-20">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete All Data
                                </Button>
                            </div>
                        </div>

                        {/* Account */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                            
                            <div className="space-y-3">
                                <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-red-400 hover:bg-red-500 hover:bg-opacity-20"
                                    onClick={() => window.location.href = '/api/logout'}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <BottomNavigation activeTab="profile" />
            </div>

            {/* Desktop View */}
            <div className={`${isMobile ? 'hidden' : 'block'} container mx-auto px-4 py-8`}>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="text-white hover:bg-white hover:bg-opacity-10 mr-4">
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Back to Habits
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Profile Section */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                    </h3>
                                    <p className="text-white opacity-70">{user?.email}</p>
                                </div>
                            </div>
                            <Link href="/profile">
                                <Button className="w-full bg-white bg-opacity-20 text-white hover:bg-opacity-30">
                                    View Profile
                                </Button>
                            </Link>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <Bell className="w-6 h-6 mr-2" />
                                Notifications
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Push Notifications</span>
                                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Sound</span>
                                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white">Vibration</span>
                                    <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                {darkMode ? <Moon className="w-6 h-6 mr-2" /> : <Sun className="w-6 h-6 mr-2" />}
                                Appearance
                            </h3>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-white">Dark Mode</span>
                                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="bg-white bg-opacity-10 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Data Management</h3>
                            
                            <div className="space-y-3">
                                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white hover:bg-opacity-10">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </Button>
                                
                                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white hover:bg-opacity-10">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Data
                                </Button>
                                
                                <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500 hover:bg-opacity-20">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete All Data
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="mt-8">
                        <div className="bg-white bg-opacity-10 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Account</h3>
                            <Button 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-500 hover:bg-opacity-20"
                                onClick={() => window.location.href = '/api/logout'}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}