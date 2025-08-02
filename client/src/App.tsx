import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Statistics from "@/pages/Statistics";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
    const { isAuthenticated, isLoading } = useAuth();

    return (
        <Switch>
            {isLoading || !isAuthenticated ? (
                <Route path="/" component={Landing} />
            ) : (
                <>
                    <Route path="/" component={Home} />
                    <Route path="/statistics" component={Statistics} />
                    <Route path="/journal" component={Journal} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/settings" component={Settings} />
                </>
            )}
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TooltipProvider>
                    <Toaster />
                    <Router />
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
