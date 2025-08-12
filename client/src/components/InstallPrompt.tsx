import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPrompt() {
  const { canInstall, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!canInstall || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (!success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  // Check if already dismissed this session
  if (sessionStorage.getItem('install-prompt-dismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 border shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Install Momentum</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Install Momentum for a better experience with offline access and notifications.
        </p>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleInstall}
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm"
          >
            Install App
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="text-sm"
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}