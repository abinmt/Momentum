import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Target, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    useEffect(() => {
        if (task) {
            setTitle(task.name);
            setGoal(task.defaultGoal || "");
            setSchedule("daily");
        }
    }, [task]);

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
        };

        onSave(taskConfig);
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gradient-primary text-white border-none max-w-md mx-auto bottom-0 top-auto translate-y-0 rounded-t-3xl rounded-b-none">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                    <DialogTitle className="text-xl font-bold">Confirm Task</DialogTitle>
                    <div></div>
                </DialogHeader>

                {/* Task Icon and Title */}
                <div className="text-center mb-6">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <ProgressRing progress={0} size={80} strokeWidth={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <task.icon className="w-8 h-8 text-white" />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute -top-1 -right-1 bg-gray-600 rounded-full p-1 w-6 h-6"
                        >
                            <MoreHorizontal className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{title.toUpperCase()}</h3>
                    <p className="text-sm opacity-80">
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
                        <ChevronRight className="w-5 h-5 text-white opacity-60" />
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

                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-white" />
                            <span className="text-white">Task Days</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-white opacity-80">Every Day</span>
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
        </Dialog>
    );
}
