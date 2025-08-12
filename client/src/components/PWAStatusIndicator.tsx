import { useState } from 'react';
import { Wifi, WifiOff, Download, RotateCw, HardDrive, Signal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvancedPWA } from '@/hooks/useAdvancedPWA';

interface PWAStatusIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
}

export default function PWAStatusIndicator({ compact = false, showDetails = false }: PWAStatusIndicatorProps) {
  const {
    isOnline,
    networkSpeed,
    cacheStatus,
    updateAvailable,
    canInstall,
    storageUsed,
    storageQuota,
    installApp,
    updateServiceWorker,
    clearCache,
    getCacheStats
  } = useAdvancedPWA();

  const [showCacheStats, setShowCacheStats] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const handleShowCacheStats = async () => {
    if (!showCacheStats) {
      const stats = await getCacheStats();
      setCacheStats(stats);
    }
    setShowCacheStats(!showCacheStats);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getNetworkIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    
    switch (networkSpeed) {
      case 'fast':
        return <Signal className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'slow':
        return <Signal className="w-4 h-4 text-orange-500" />;
      default:
        return <Wifi className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCacheStatusColor = () => {
    switch (cacheStatus) {
      case 'ready': return 'bg-green-500';
      case 'updating': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getNetworkIcon()}
        <div className={`w-2 h-2 rounded-full ${getCacheStatusColor()}`} />
        {updateAvailable && (
          <Button
            size="sm"
            variant="outline"
            onClick={updateServiceWorker}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Update
          </Button>
        )}
        {canInstall && (
          <Button
            size="sm"
            variant="outline"
            onClick={installApp}
            className="text-xs"
          >
            Install
          </Button>
        )}
      </div>
    );
  }

  if (!showDetails) {
    // Don't show anything if everything is normal and working
    if (isOnline && !updateAvailable && !canInstall && cacheStatus === 'ready') {
      return null;
    }

    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-lg">
          {/* Network Status - only show if offline */}
          {!isOnline && (
            <>
              {getNetworkIcon()}
              <Badge variant="destructive" className="text-xs">
                Offline
              </Badge>
            </>
          )}
          
          {/* Update Available */}
          {updateAvailable && (
            <Button 
              size="sm" 
              onClick={updateServiceWorker}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
            >
              <Download className="w-3 h-3 mr-1" />
              Update
            </Button>
          )}
          
          {/* Install Available */}
          {canInstall && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={installApp}
              className="border-white/30 text-white hover:bg-white/10 text-xs px-2 py-1 h-6"
            >
              Install App
            </Button>
          )}

          {/* Cache Status - only show if there's an issue */}
          {cacheStatus === 'error' && (
            <Badge variant="destructive" className="text-xs">
              Cache Error
            </Badge>
          )}
          
          {cacheStatus === 'updating' && (
            <Badge variant="secondary" className="text-xs">
              Updating...
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white bg-opacity-10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <span>PWA Status</span>
          {getNetworkIcon()}
        </CardTitle>
        <CardDescription className="text-white opacity-70">
          Application performance and connectivity status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Network</span>
          <div className="flex items-center space-x-2">
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? `Online (${networkSpeed})` : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Cache Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Cache</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getCacheStatusColor()}`} />
            <span className="text-sm capitalize text-white">{cacheStatus}</span>
          </div>
        </div>

        {/* Storage Usage */}
        {storageQuota > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Storage</span>
              <span className="text-sm text-white opacity-60">
                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full" 
                style={{ width: `${(storageUsed / storageQuota) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {updateAvailable && (
            <Button size="sm" onClick={updateServiceWorker} className="bg-white/20 text-white hover:bg-white/30 border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Update App
            </Button>
          )}
          
          {canInstall && (
            <Button size="sm" variant="outline" onClick={installApp} className="border-white/30 text-white hover:bg-white/10 bg-transparent">
              Install App
            </Button>
          )}
          
          <Button size="sm" variant="outline" onClick={clearCache} className="border-white/30 text-white hover:bg-white/10 bg-transparent">
            <RotateCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          
          <Button size="sm" variant="outline" onClick={handleShowCacheStats} className="border-white/30 text-white hover:bg-white/10 bg-transparent">
            <HardDrive className="w-4 h-4 mr-2" />
            {showCacheStats ? 'Hide' : 'Show'} Cache Stats
          </Button>
        </div>

        {/* Cache Statistics */}
        {showCacheStats && cacheStats && (
          <div className="pt-4 border-t border-white/20 space-y-2">
            <h4 className="text-sm font-medium text-white">Cache Statistics</h4>
            {cacheStats.map((cache: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white opacity-60">{cache.name}</span>
                <span className="text-white">{cache.entries} entries</span>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {!isOnline && (
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">You're offline. Some features may be limited.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}