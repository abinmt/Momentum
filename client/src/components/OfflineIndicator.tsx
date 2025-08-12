import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Badge } from '@/components/ui/badge';

export default function OfflineIndicator() {
  const { isOnline, isOffline, queueLength } = useOffline();

  if (isOnline && queueLength === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {isOffline ? (
        <Badge variant="destructive" className="flex items-center space-x-2 px-3 py-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
          {queueLength > 0 && (
            <span className="bg-white bg-opacity-30 text-xs px-2 py-1 rounded-full">
              {queueLength}
            </span>
          )}
        </Badge>
      ) : queueLength > 0 ? (
        <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
          <Cloud className="w-4 h-4 animate-pulse" />
          <span>Syncing {queueLength} changes...</span>
        </Badge>
      ) : null}
    </div>
  );
}