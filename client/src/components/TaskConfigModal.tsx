import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Target, MoreHorizontal, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ProgressRing from "./ProgressRing";

interface TaskConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
    onSave: (taskConfig: any) => void;
}

export default function TaskConfigModal({ isOpen, onClose, task, onSave }: TaskConfigModalProps) {
    const [title, setTitle] = useState("");
    const [goal, setGoal] = useState("");
    const [schedule, setSchedule] = useState("daily");
    const [isDayLongTask, setIsDayLongTask] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [showTaskTypeDialog, setShowTaskTypeDialog] = useState(false);
    const [showRemindersDialog, setShowRemindersDialog] = useState(false);
    const [showIconColorDialog, setShowIconColorDialog] = useState(false);
    const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
    const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
    const [taskType, setTaskType] = useState("simple");
    const [selectedColor, setSelectedColor] = useState("primary");
    const [selectedIcon, setSelectedIcon] = useState("check");
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [isPrivate, setIsPrivate] = useState(false);
    
    const daysOfWeek = [
        { key: "mon", label: "Monday", short: "M" },
        { key: "tue", label: "Tuesday", short: "T" },
        { key: "wed", label: "Wednesday", short: "W" },
        { key: "thu", label: "Thursday", short: "T" },
        { key: "fri", label: "Friday", short: "F" },
        { key: "sat", label: "Saturday", short: "S" },
        { key: "sun", label: "Sunday", short: "S" },
    ];

    useEffect(() => {
        if (task) {
            setTitle(task.name);
            setGoal(task.defaultGoal || "");
            setSchedule("daily");
            setIsDayLongTask(false);
            setSelectedDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
            setTaskType(task.type || "simple");
            setSelectedColor(task.color || "primary");
            setSelectedIcon(task.iconName || "check");
            setReminderEnabled(false);
            setReminderTime("09:00");
            setIsPrivate(false);
        }
    }, [task]);

    const toggleDay = (dayKey: string) => {
        setSelectedDays(prev => 
            prev.includes(dayKey) 
                ? prev.filter(day => day !== dayKey)
                : [...prev, dayKey]
        );
    };

    const getScheduleDisplayText = () => {
        if (selectedDays.length === 7) return "Every Day";
        if (selectedDays.length === 5 && !selectedDays.includes("sat") && !selectedDays.includes("sun")) {
            return "Weekdays";
        }
        if (selectedDays.length === 2 && selectedDays.includes("sat") && selectedDays.includes("sun")) {
            return "Weekends";
        }
        if (selectedDays.length === 0) return "Never";
        if (selectedDays.length <= 3) {
            return selectedDays.map(day => daysOfWeek.find(d => d.key === day)?.short).join(", ");
        }
        return `${selectedDays.length} days`;
    };

    const handleSave = () => {
        if (!title.trim()) return; // Only require a title to save

        const taskConfig = {
            title: title.trim(),
            icon: selectedIcon,
            color: selectedColor,
            type: taskType,
            goal: goal ? parseInt(goal) : null,
            goalUnit: task?.unit || "times",
            schedule,
            isDayLongTask,
            selectedDays: selectedDays.join(','),
            reminderEnabled,
            reminderTime,
            isPrivate,
        };

        onSave(taskConfig);
    };

    // Always render the modal - it can handle both null and existing tasks

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto md:max-w-2xl bottom-0 md:bottom-auto top-auto md:top-1/2 translate-y-0 md:-translate-y-1/2 rounded-t-3xl md:rounded-xl rounded-b-none md:rounded-b-xl [&>button[aria-label='Close']]:hidden max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div></div>
                    <DialogTitle className="text-xl font-bold">Create Habit</DialogTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-6 h-6 text-white" />
                    </Button>
                </DialogHeader>

                {/* Habit Icon and Title */}
                <div className="text-center mb-6 md:mb-8">
                    <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto mb-4">
                        <ProgressRing progress={0} size={80} strokeWidth={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl md:text-4xl text-white">
                                {selectedIcon === 'check' ? '✓' : 
                                selectedIcon === 'heart' ? '♥' : 
                                selectedIcon === 'star' ? '★' : 
                                selectedIcon === 'target' ? '●' : 
                                selectedIcon === 'zap' ? '⚡' : 
                                selectedIcon === 'book' ? '📚' : 
                                selectedIcon === 'dumbbell' ? '🏋️' : 
                                selectedIcon === 'apple' ? '🍎' : 
                                selectedIcon === 'moon' ? '🌙' : 
                                selectedIcon === 'sun' ? '☀️' : 
                                selectedIcon === 'coffee' ? '☕' : 
                                selectedIcon === 'music' ? '🎵' : '✓'}
                            </span>
                        </div>

                    </div>
                    <h3 className="text-lg md:text-2xl font-bold mb-2">{title.toUpperCase() || "NEW HABIT"}</h3>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-2">
                    {/* Habit Configuration */}
                    <div className="space-y-4 mb-8">
                    <div className="bg-white bg-opacity-20 rounded-xl p-4">
                        <div className="text-sm opacity-80 mb-1">TITLE:</div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-white font-semibold p-0 focus:ring-0"
                            placeholder="Habit title"
                        />
                        <div className="text-xs opacity-60 mt-1">{title.length} / 50</div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white border-opacity-20">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="text-white">Day-Long Habit</span>
                        </div>
                        <Switch
                            checked={isDayLongTask}
                            onCheckedChange={setIsDayLongTask}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white border-opacity-20">
                        <div className="flex items-center space-x-3">
                            <Target className="w-5 h-5 text-white" />
                            <span className="text-white">Goal</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="bg-transparent border-none text-white text-right w-20 p-0 focus:ring-0"
                                placeholder="0"
                                type="number"
                            />
                            <span className="text-white opacity-80">{task?.unit || "times"}</span>
                            <ChevronRight className="w-5 h-5 text-white opacity-60" />
                        </div>
                    </div>

                    <div 
                        className="flex items-center justify-between py-4 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg px-2 -mx-2 transition-colors"
                        onClick={() => setShowScheduleDialog(true)}
                    >
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="text-white">Habit Days</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-white opacity-80">{getScheduleDisplayText()}</span>
                            <ChevronRight className="w-5 h-5 text-white opacity-60" />
                        </div>
                    </div>

                    {/* Task Type Options */}
                    <div className="border-t border-white border-opacity-20 pt-4">
                        <h4 className="text-sm opacity-80 font-semibold mb-3">TASK TYPE</h4>
                        
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'timed' ? 'bg-white bg-opacity-20' : ''}`}
                                onClick={() => setTaskType('timed')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold">T</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Timed Task</div>
                                        <div className="text-xs opacity-70">Track time spent on activity</div>
                                    </div>
                                    {taskType === 'timed' && <Check className="w-4 h-4 ml-auto" />}
                                </div>
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'negative' ? 'bg-white bg-opacity-20' : ''}`}
                                onClick={() => setTaskType('negative')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold">-</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Negative Task</div>
                                        <div className="text-xs opacity-70">Break bad habits</div>
                                    </div>
                                    {taskType === 'negative' && <Check className="w-4 h-4 ml-auto" />}
                                </div>
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'health' ? 'bg-white bg-opacity-20' : ''}`}
                                onClick={() => setTaskType('health')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold">♥</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Health Task</div>
                                        <div className="text-xs opacity-70">Integrate with health data</div>
                                    </div>
                                    {taskType === 'health' && <Check className="w-4 h-4 ml-auto" />}
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Reminders Section */}
                    <div className="border-t border-white border-opacity-20 pt-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-white" />
                                <span className="text-white">Enable Reminders</span>
                            </div>
                            <Switch
                                checked={reminderEnabled}
                                onCheckedChange={setReminderEnabled}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        
                        {reminderEnabled && (
                            <div className="mt-3">
                                <label className="text-sm opacity-80">Reminder Time</label>
                                <Input
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="bg-white bg-opacity-20 border-none text-white mt-2"
                                />
                            </div>
                        )}
                    </div>

                    {/* Icon & Color Section */}
                    <div className="border-t border-white border-opacity-20 pt-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                            onClick={() => setShowIconColorDialog(true)}
                        >
                            <div className="flex items-center space-x-3">
                                <Target className="w-5 h-5 text-white" />
                                <span>Icon & Color</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Privacy Section */}
                    <div className="border-t border-white border-opacity-20 pt-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                                <Target className="w-5 h-5 text-white" />
                                <span className="text-white">Private Habit</span>
                            </div>
                            <Switch
                                checked={isPrivate}
                                onCheckedChange={setIsPrivate}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                    </div>
                    </div>
                </div>

                {/* Fixed Save Button */}
                <div className="flex-shrink-0 pt-4 border-t border-white border-opacity-20">
                    <Button 
                        className="w-full bg-black bg-opacity-30 text-white border-none hover:bg-opacity-40 py-6 text-lg font-semibold"
                        onClick={handleSave}
                    >
                        SAVE HABIT
                    </Button>
                </div>
            </DialogContent>
            
            {/* Schedule Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Habit Days</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Quick Options */}
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                onClick={() => setSelectedDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])}
                            >
                                <span>Every Day</span>
                                {selectedDays.length === 7 && <Check className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                onClick={() => setSelectedDays(["mon", "tue", "wed", "thu", "fri"])}
                            >
                                <span>Weekdays</span>
                                {selectedDays.length === 5 && !selectedDays.includes("sat") && !selectedDays.includes("sun") && <Check className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                onClick={() => setSelectedDays(["sat", "sun"])}
                            >
                                <span>Weekends</span>
                                {selectedDays.length === 2 && selectedDays.includes("sat") && selectedDays.includes("sun") && <Check className="w-4 h-4" />}
                            </Button>
                        </div>
                        
                        {/* Custom Day Selection */}
                        <div className="border-t border-white border-opacity-20 pt-4">
                            <h4 className="text-sm opacity-80 mb-3">Custom</h4>
                            <div className="grid grid-cols-7 gap-2">
                                {daysOfWeek.map((day) => (
                                    <Button
                                        key={day.key}
                                        variant="ghost"
                                        size="sm"
                                        className={`w-10 h-10 rounded-full p-0 ${
                                            selectedDays.includes(day.key)
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                                        }`}
                                        onClick={() => toggleDay(day.key)}
                                    >
                                        {day.short}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <Button
                        className="w-full bg-black bg-opacity-30 text-white hover:bg-opacity-40 mt-6"
                        onClick={() => setShowScheduleDialog(false)}
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
            
            {/* More Options Dialog */}
            <Dialog open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Task Options</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Task Type Options */}
                        <div className="space-y-3">
                            <h4 className="text-sm opacity-80 font-semibold">TASK TYPE</h4>
                            
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'timed' ? 'bg-white bg-opacity-20' : ''}`}
                                    onClick={() => setTaskType('timed')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold">T</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Timed Task</div>
                                            <div className="text-xs opacity-70">Track time spent on activity</div>
                                        </div>
                                        {taskType === 'timed' && <Check className="w-4 h-4 ml-auto" />}
                                    </div>
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'negative' ? 'bg-white bg-opacity-20' : ''}`}
                                    onClick={() => setTaskType('negative')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold">-</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Negative Task</div>
                                            <div className="text-xs opacity-70">Break bad habits</div>
                                        </div>
                                        {taskType === 'negative' && <Check className="w-4 h-4 ml-auto" />}
                                    </div>
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-white hover:bg-white hover:bg-opacity-20 p-4 ${taskType === 'health' ? 'bg-white bg-opacity-20' : ''}`}
                                    onClick={() => setTaskType('health')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold">♥</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Health Task</div>
                                            <div className="text-xs opacity-70">Integrate with health data</div>
                                        </div>
                                        {taskType === 'health' && <Check className="w-4 h-4 ml-auto" />}
                                    </div>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Advanced Settings */}
                        <div className="border-t border-white border-opacity-20 pt-4">
                            <h4 className="text-sm opacity-80 font-semibold mb-3">ADVANCED</h4>
                            
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                    onClick={() => setShowRemindersDialog(true)}
                                >
                                    <span>Reminders</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                    onClick={() => setShowIconColorDialog(true)}
                                >
                                    <span>Icon & Color</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-white hover:bg-white hover:bg-opacity-20"
                                    onClick={() => setShowPrivacyDialog(true)}
                                >
                                    <span>Privacy</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <Button
                        className="w-full bg-black bg-opacity-30 text-white hover:bg-opacity-40 mt-6"
                        onClick={() => setShowMoreOptions(false)}
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
            
            {/* Reminders Dialog */}
            <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Reminders</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <span>Enable Reminders</span>
                            <Switch
                                checked={reminderEnabled}
                                onCheckedChange={setReminderEnabled}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        
                        {reminderEnabled && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm opacity-80">Reminder Time</label>
                                    <Input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="bg-white bg-opacity-20 border-none text-white mt-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <Button
                        className="w-full bg-black bg-opacity-30 text-white hover:bg-opacity-40 mt-6"
                        onClick={() => setShowRemindersDialog(false)}
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
            
            {/* Icon & Color Dialog */}
            <Dialog open={showIconColorDialog} onOpenChange={setShowIconColorDialog}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Icon & Color</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* Color Selection */}
                        <div>
                            <h4 className="text-sm opacity-80 font-semibold mb-3">COLORS</h4>
                            <div className="grid grid-cols-6 gap-3">
                                {[
                                    { name: 'primary', color: 'bg-orange-500' },
                                    { name: 'blue', color: 'bg-blue-500' },
                                    { name: 'green', color: 'bg-green-500' },
                                    { name: 'red', color: 'bg-red-500' },
                                    { name: 'purple', color: 'bg-purple-500' },
                                    { name: 'yellow', color: 'bg-yellow-500' },
                                    { name: 'pink', color: 'bg-pink-500' },
                                    { name: 'indigo', color: 'bg-indigo-500' },
                                    { name: 'teal', color: 'bg-teal-500' },
                                    { name: 'gray', color: 'bg-gray-500' },
                                    { name: 'cyan', color: 'bg-cyan-500' },
                                    { name: 'emerald', color: 'bg-emerald-500' }
                                ].map((colorOption) => (
                                    <Button
                                        key={colorOption.name}
                                        variant="ghost"
                                        size="sm"
                                        className={`w-10 h-10 rounded-full p-0 ${colorOption.color} ${
                                            selectedColor === colorOption.name ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                                        }`}
                                        onClick={() => setSelectedColor(colorOption.name)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Icon Selection */}
                        <div>
                            <h4 className="text-sm opacity-80 font-semibold mb-3">ICONS</h4>
                            <div className="grid grid-cols-6 gap-2">
                                {[
                                    'check', 'heart', 'star', 'target', 'zap', 'book',
                                    'dumbbell', 'apple', 'moon', 'sun', 'coffee', 'music'
                                ].map((iconName) => (
                                    <Button
                                        key={iconName}
                                        variant="ghost"
                                        size="sm"
                                        className={`w-10 h-10 rounded-lg p-0 ${
                                            selectedIcon === iconName ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                                        }`}
                                        onClick={() => setSelectedIcon(iconName)}
                                    >
                                        <span className="text-lg">{iconName === 'check' ? '✓' : iconName === 'heart' ? '♥' : iconName === 'star' ? '★' : iconName === 'target' ? '●' : iconName === 'zap' ? '⚡' : iconName === 'book' ? '📚' : iconName === 'dumbbell' ? '🏋️' : iconName === 'apple' ? '🍎' : iconName === 'moon' ? '🌙' : iconName === 'sun' ? '☀️' : iconName === 'coffee' ? '☕' : '🎵'}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <Button
                        className="w-full bg-black bg-opacity-30 text-white hover:bg-opacity-40 mt-6"
                        onClick={() => setShowIconColorDialog(false)}
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
            
            {/* Privacy Dialog */}
            <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Privacy</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <div className="font-semibold">Private Task</div>
                                <div className="text-xs opacity-70">Hide from shared statistics</div>
                            </div>
                            <Switch
                                checked={isPrivate}
                                onCheckedChange={setIsPrivate}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        
                        <div className="border-t border-white border-opacity-20 pt-4">
                            <p className="text-sm opacity-80">
                                Private tasks won't appear in shared dashboards or social features. 
                                Only you can see your progress.
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        className="w-full bg-black bg-opacity-30 text-white hover:bg-opacity-40 mt-6"
                        onClick={() => setShowPrivacyDialog(false)}
                    >
                        Done
                    </Button>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
