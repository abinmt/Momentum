import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
            <div className="max-w-md w-full">
                <Card className="bg-white bg-opacity-95 backdrop-blur-sm shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">M</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Momentum</h1>
                            <p className="text-gray-600">Build lasting habits, track your progress</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <span className="text-gray-700">Track daily habits</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <span className="text-gray-700">Beautiful progress visualization</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <span className="text-gray-700">Smart reminders and notifications</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-gradient-primary text-white border-none hover:opacity-90 py-6 text-lg font-semibold"
                            onClick={() => window.location.href = '/api/login'}
                        >
                            Get Started
                        </Button>

                        <p className="text-sm text-gray-500 mt-4">
                            Start building better habits today
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
