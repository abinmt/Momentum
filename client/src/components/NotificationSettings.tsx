import { useState } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  initialSettings?: {
    enableNotifications: boolean;
    reminderTime: string;
    motivationalMessages: boolean;
    streakReminders: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

export default function NotificationSettings({ 
  initialSettings = {
    enableNotifications: false,
    reminderTime: '09:00',
    motivationalMessages: true,
    streakReminders: true
  },
  onSettingsChange 
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    isSupported,
    isGranted,
    isDenied,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();
  
  const { toast } = useToast();

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      if (!settings.enableNotifications) {
        // Enable notifications
        const permission = await requestPermission();
        
        if (permission) {
          const subscription = await subscribe();
          if (subscription) {
            const newSettings = { ...settings, enableNotifications: true };
            setSettings(newSettings);
            onSettingsChange?.(newSettings);
            
            toast({
              title: "Notifications Enabled",
              description: "You'll receive habit reminders and motivational messages.",
            });
          } else {
            toast({
              title: "Subscription Failed", 
              description: "Could not set up push notifications. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings to receive reminders.",
            variant: "destructive"
          });
        }
      } else {
        // Disable notifications
        const success = await unsubscribe();
        if (success) {
          const newSettings = { ...settings, enableNotifications: false };
          setSettings(newSettings);
          onSettingsChange?.(newSettings);
          
          toast({
            title: "Notifications Disabled",
            description: "You won't receive habit reminders anymore.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast({
        title: "Test Sent",
        description: "Check your notifications - you should receive a test message shortly!",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not send test notification. Please check your settings.",
        variant: "destructive"
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="w-5 h-5" />
            <span>Notifications Not Supported</span>
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Push Notifications</span>
        </CardTitle>
        <CardDescription>
          Get reminders for your habits and motivational messages to stay on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-base font-medium">Enable Notifications</label>
            <div className="text-sm text-muted-foreground">
              Receive push notifications for habit reminders
            </div>
          </div>
          <Switch
            checked={settings.enableNotifications && isSubscribed}
            onCheckedChange={handleEnableNotifications}
            disabled={isLoading || isDenied}
          />
        </div>

        {isDenied && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
            Notifications are blocked. Please enable them in your browser settings to receive reminders.
          </div>
        )}

        {/* Notification Settings */}
        {settings.enableNotifications && isGranted && (
          <>
            {/* Daily Reminder Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Reminder Time</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Motivational Messages */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium">Motivational Messages</label>
                <div className="text-sm text-muted-foreground">
                  Receive inspiring quotes and encouragement
                </div>
              </div>
              <Switch
                checked={settings.motivationalMessages}
                onCheckedChange={(checked) => handleSettingChange('motivationalMessages', checked)}
              />
            </div>

            {/* Streak Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium">Streak Reminders</label>
                <div className="text-sm text-muted-foreground">
                  Get notified when you're close to breaking a streak
                </div>
              </div>
              <Switch
                checked={settings.streakReminders}
                onCheckedChange={(checked) => handleSettingChange('streakReminders', checked)}
              />
            </div>

            {/* Test Notification */}
            <div className="pt-4 border-t">
              <Button 
                onClick={handleTestNotification}
                variant="outline"
                className="w-full"
                disabled={!isSubscribed}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          </>
        )}

        {/* Status Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Status: {isSubscribed ? 'Connected' : 'Not connected'}</div>
          <div>Permission: {isGranted ? 'Granted' : isDenied ? 'Denied' : 'Not requested'}</div>
        </div>
      </CardContent>
    </Card>
  );
}