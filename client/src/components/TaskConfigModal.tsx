import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Target, MoreHorizontal, Check } from "lucide-react";
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
    const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
    
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
        if (!task) return;

        const taskConfig = {
            title,
            icon: task.iconName || "check",
            color: task.color || "primary",
            type: task.type || "simple",
            goal: goal ? parseInt(goal) : null,
            goalUnit: task.unit,
            schedule,
            isDayLongTask,
            selectedDays: selectedDays.join(','), // Convert array to comma-separated string
        };

        onSave(taskConfig);
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto md:max-w-2xl bottom-0 md:bottom-auto top-auto md:top-1/2 translate-y-0 md:-translate-y-1/2 rounded-t-3xl md:rounded-xl rounded-b-none md:rounded-b-xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                    <DialogTitle className="text-xl font-bold">Confirm Task</DialogTitle>
                    <div></div>
                </DialogHeader>

                {/* Task Icon and Title */}
                <div className="text-center mb-6 md:mb-8">
                    <div className="relative w-20 h-20 md:w-32 md:h-32 mx-auto mb-4">
                        <ProgressRing progress={0} size={80} strokeWidth={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <task.icon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute -top-1 -right-1 bg-gray-600 rounded-full p-1 w-6 h-6 md:w-8 md:h-8"
                        >
                            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </Button>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold mb-2">{title.toUpperCase()}</h3>
                    <p className="text-sm md:text-base opacity-80">
                        ♥ This task uses data from the Health app. Please grant Stride permission if prompted.
                    </p>
                </div>

                {/* Task Configuration */}
                <div className="space-y-4 mb-8">
                    <div className="bg-white bg-opacity-20 rounded-xl p-4">
                        <div className="text-sm opacity-80 mb-1">TITLE:</div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-white font-semibold p-0 focus:ring-0"
                            placeholder="Task title"
                        />
                        <div className="text-xs opacity-60 mt-1">{title.length} / 50</div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white border-opacity-20">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="text-white">Day-Long Task</span>
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
                            <span className="text-white opacity-80">{task.unit}</span>
                            <ChevronRight className="w-5 h-5 text-white opacity-60" />
                        </div>
                    </div>

                    <div 
                        className="flex items-center justify-between py-4 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg px-2 -mx-2 transition-colors"
                        onClick={() => setShowScheduleDialog(true)}
                    >
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="text-white">Task Days</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-white opacity-80">{getScheduleDisplayText()}</span>
                            <ChevronRight className="w-5 h-5 text-white opacity-60" />
                        </div>
                    </div>
                </div>

                <Button 
                    className="w-full bg-black bg-opacity-30 text-white border-none hover:bg-opacity-40 py-6 text-lg font-semibold"
                    onClick={handleSave}
                >
                    SAVE TASK
                </Button>
            </DialogContent>
            
            {/* Schedule Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Task Days</DialogTitle>
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
        </Dialog>
    );
}
