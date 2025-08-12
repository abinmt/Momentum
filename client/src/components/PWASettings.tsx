import { useState } from 'react';
import { Download, Smartphone, Monitor, Wifi, HardDrive, RotateCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedPWA } from '@/hooks/useAdvancedPWA';
import PWAStatusIndicator from '@/components/PWAStatusIndicator';

interface PWASettingsProps {
  onClose?: () => void;
}

export default function PWASettings({ onClose }: PWASettingsProps) {
  const {
    isInstalled,
    canInstall,
    updateAvailable,
    isOnline,
    networkSpeed,
    cacheStatus,
    storageUsed,
    storageQuota,
    installApp,
    updateServiceWorker,
    clearCache,
    refreshNetworkInfo,
    refreshStorageInfo
  } = useAdvancedPWA();

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [preloadContent, setPreloadContent] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success && onClose) {
      onClose();
    }
  };

  const handleUpdate = () => {
    updateServiceWorker();
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    await clearCache();
    await refreshStorageInfo();
    setIsClearing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageQuota || storageQuota === 0) return 0;
    return Math.round((storageUsed / storageQuota) * 100);
  };

  return (
    <div className="space-y-6">
      {/* App Status */}
      <Card className="bg-white bg-opacity-10 dark:bg-gray-800/50 border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white dark:text-gray-100">
            <Smartphone className="w-5 h-5" />
            <span>App Status</span>
          </CardTitle>
          <CardDescription className="text-white dark:text-gray-400 opacity-70">
            Current installation and update status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Installation Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white dark:text-gray-100">Installation</span>
            <div className="flex items-center space-x-2">
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Installed' : 'Web App'}
              </Badge>
              {canInstall && !isInstalled && (
                <Button size="sm" onClick={handleInstall} className="bg-white/20 text-white hover:bg-white/30 border-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white dark:text-gray-100">Updates</span>
            <div className="flex items-center space-x-2">
              {updateAvailable ? (
                <>
                  <Badge variant="destructive">Update Available</Badge>
                  <Button size="sm" onClick={handleUpdate} className="bg-white/20 text-white hover:bg-white/30 border-white/20">
                    <Download className="w-4 h-4 mr-2" />
                    Update Now
                  </Button>
                </>
              ) : (
                <Badge variant="default">Up to Date</Badge>
              )}
            </div>
          </div>

          {/* Auto Update Setting */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-white dark:text-gray-100">Auto Updates</span>
              <p className="text-sm text-white dark:text-gray-400 opacity-60">
                Automatically install app updates
              </p>
            </div>
            <Switch
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card className="bg-white bg-opacity-10 dark:bg-gray-800/50 border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white dark:text-gray-100">
            <Monitor className="w-5 h-5" />
            <span>Performance</span>
          </CardTitle>
          <CardDescription className="text-white dark:text-gray-400 opacity-70">
            Optimize app performance and data usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white dark:text-gray-100">Network</span>
            <div className="flex items-center space-x-2">
              <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? `Online (${networkSpeed})` : 'Offline'}
              </Badge>
              <Button size="sm" variant="outline" onClick={refreshNetworkInfo} className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Background Sync */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-white dark:text-gray-100">Background Sync</span>
              <p className="text-sm text-white dark:text-gray-400 opacity-60">
                Sync data when connection is restored
              </p>
            </div>
            <Switch
              checked={backgroundSync}
              onCheckedChange={setBackgroundSync}
            />
          </div>

          {/* Preload Content */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-white dark:text-gray-100">Preload Content</span>
              <p className="text-sm text-white dark:text-gray-400 opacity-60">
                Download content for offline use
              </p>
            </div>
            <Switch
              checked={preloadContent}
              onCheckedChange={setPreloadContent}
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card className="bg-white bg-opacity-10 dark:bg-gray-800/50 border-white/20 dark:border-gray-600/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white dark:text-gray-100">
            <HardDrive className="w-5 h-5" />
            <span>Storage</span>
          </CardTitle>
          <CardDescription className="text-white dark:text-gray-400 opacity-70">
            Manage app data and cache storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          {storageQuota > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span className="text-white dark:text-gray-300">Used Storage</span>
                <span className="text-white dark:text-gray-300">{formatBytes(storageUsed)} / {formatBytes(storageQuota)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getStoragePercentage()}%` }}
                />
              </div>
              <div className="text-xs text-white dark:text-gray-400 opacity-60 text-center">
                {getStoragePercentage()}% used
              </div>
            </div>
          )}

          {/* Cache Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white dark:text-gray-100">Cache Status</span>
            <Badge 
              variant={
                cacheStatus === 'ready' ? 'default' :
                cacheStatus === 'updating' ? 'secondary' :
                cacheStatus === 'error' ? 'destructive' : 'secondary'
              }
            >
              {cacheStatus}
            </Badge>
          </div>

          {/* Clear Cache */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-white dark:text-gray-100">Clear Cache</span>
              <p className="text-sm text-white dark:text-gray-400 opacity-60">
                Remove all cached data and files
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleClearCache}
              disabled={isClearing}
              className="border-white/30 text-white hover:bg-white/10 disabled:opacity-50 bg-transparent"
            >
              {isClearing ? (
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCw className="w-4 h-4 mr-2" />
              )}
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>

          {/* Storage Warning */}
          {getStoragePercentage() > 80 && (
            <div className="flex items-start space-x-2 p-3 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-200">
                  Storage Almost Full
                </p>
                <p className="text-amber-300">
                  Consider clearing cache to free up space and improve performance.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <PWAStatusIndicator showDetails={true} />
    </div>
  );
}