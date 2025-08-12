import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NetworkStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function NetworkStatus({ showDetails = false, className = '' }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkSpeed, setNetworkSpeed] = useState<string>('unknown');
  const [isChecking, setIsChecking] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkNetworkSpeed();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkSpeed('offline');
    };

    // Connection API
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || connection.type || 'unknown');
      
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
        if (isOnline) {
          checkNetworkSpeed();
        }
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (isOnline) {
      checkNetworkSpeed();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  const checkNetworkSpeed = async () => {
    if (!isOnline) return;

    setIsChecking(true);
    try {
      // Use Connection API if available
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        const speedMap: { [key: string]: string } = {
          'slow-2g': 'very-slow',
          '2g': 'slow',
          '3g': 'medium',
          '4g': 'fast'
        };
        setNetworkSpeed(speedMap[connection.effectiveType] || 'medium');
        setIsChecking(false);
        return;
      }

      // Fallback: measure ping to manifest
      const startTime = performance.now();
      const response = await fetch('/manifest.json?t=' + Date.now(), { 
        cache: 'no-store',
        mode: 'cors'
      });
      const duration = performance.now() - startTime;
      
      if (response.ok) {
        let speed = 'slow';
        if (duration < 100) speed = 'fast';
        else if (duration < 300) speed = 'medium';
        setNetworkSpeed(speed);
      } else {
        setNetworkSpeed('error');
      }
    } catch (error) {
      setNetworkSpeed('error');
    }
    setIsChecking(false);
  };

  const getNetworkIcon = () => {
    if (isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    switch (networkSpeed) {
      case 'fast':
        return <Signal className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'slow':
      case 'very-slow':
        return <Signal className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isChecking) return 'Checking...';
    
    const speedLabels: { [key: string]: string } = {
      'fast': 'Fast',
      'medium': 'Good',
      'slow': 'Slow',
      'very-slow': 'Very Slow',
      'error': 'Error'
    };
    
    return speedLabels[networkSpeed] || 'Online';
  };

  const getVariant = () => {
    if (!isOnline || networkSpeed === 'error') return 'destructive';
    if (networkSpeed === 'slow' || networkSpeed === 'very-slow') return 'secondary';
    return 'default';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getNetworkIcon()}
        <Badge variant={getVariant()} className="text-xs">
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {getNetworkIcon()}
        <Badge variant={getVariant()}>
          {getStatusText()}
        </Badge>
      </div>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Connection: {connectionType}</div>
          {isOnline && networkSpeed !== 'error' && (
            <div>Speed: {networkSpeed}</div>
          )}
          {!isOnline && (
            <div className="text-amber-600">
              Some features may be limited while offline
            </div>
          )}
        </div>
      )}
    </div>
  );
}