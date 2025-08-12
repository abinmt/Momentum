import { useState, useEffect } from 'react';

interface PWAAdvancedState {
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  isOnline: boolean;
  networkSpeed: string;
  cacheStatus: 'loading' | 'ready' | 'updating' | 'error';
  backgroundSyncQueue: number;
  storageUsed: number;
  storageQuota: number;
}

interface ServiceWorkerUpdateInfo {
  available: boolean;
  waiting: boolean;
  installing: boolean;
}

export function useAdvancedPWA() {
  const [state, setState] = useState<PWAAdvancedState>({
    isInstalled: false,
    canInstall: false,
    updateAvailable: false,
    isOnline: navigator.onLine,
    networkSpeed: 'unknown',
    cacheStatus: 'loading',
    backgroundSyncQueue: 0,
    storageUsed: 0,
    storageQuota: 0
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [swUpdate, setSWUpdate] = useState<ServiceWorkerUpdateInfo>({
    available: false,
    waiting: false,
    installing: false
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      setState(prev => ({ 
        ...prev, 
        isInstalled: isStandalone || isInWebApp 
      }));
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    // Monitor network status
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      checkNetworkSpeed();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false, networkSpeed: 'offline' }));
    };

    // Service Worker registration and updates
    const setupServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Try enhanced service worker first, fallback to basic
          let registration;
          try {
            registration = await navigator.serviceWorker.register('/sw-enhanced.js');
          } catch (enhancedError) {
            console.warn('Enhanced SW failed, falling back to basic SW');
            registration = await navigator.serviceWorker.register('/sw.js');
          }
          
          // Check for updates immediately
          registration.update();
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              setSWUpdate(prev => ({ ...prev, installing: true }));
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    setSWUpdate(prev => ({ 
                      ...prev, 
                      available: true, 
                      waiting: true,
                      installing: false 
                    }));
                  } else {
                    setState(prev => ({ ...prev, cacheStatus: 'ready' }));
                  }
                }
              });
            }
          });

          // Listen for waiting service worker
          if (registration.waiting) {
            setSWUpdate(prev => ({ ...prev, available: true, waiting: true }));
          }

          // Periodic update checks
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          setState(prev => ({ ...prev, cacheStatus: 'ready' }));
        } catch (error) {
          console.error('SW: Registration failed', error);
          setState(prev => ({ ...prev, cacheStatus: 'error' }));
        }
      }
    };

    // Initialize
    checkInstallStatus();
    setupServiceWorker();
    checkNetworkSpeed();
    checkStorageUsage();

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Network speed detection
  const checkNetworkSpeed = async () => {
    if (!navigator.onLine) return;

    try {
      // Use Connection API if available
      const connection = (navigator as any).connection;
      if (connection) {
        setState(prev => ({ 
          ...prev, 
          networkSpeed: getNetworkSpeedLabel(connection.effectiveType)
        }));
        return;
      }

      // Fallback: measure download speed
      const startTime = performance.now();
      await fetch('/manifest.json', { cache: 'no-store' });
      const duration = performance.now() - startTime;
      
      let speed = 'slow';
      if (duration < 100) speed = 'fast';
      else if (duration < 300) speed = 'medium';
      
      setState(prev => ({ ...prev, networkSpeed: speed }));
    } catch (error) {
      setState(prev => ({ ...prev, networkSpeed: 'error' }));
    }
  };

  // Storage usage monitoring
  const checkStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setState(prev => ({
          ...prev,
          storageUsed: estimate.usage || 0,
          storageQuota: estimate.quota || 0
        }));
      } catch (error) {
        console.warn('Failed to estimate storage usage', error);
      }
    }
  };

  // Install the app
  const installApp = async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const isInstalled = result.outcome === 'accepted';
      
      if (isInstalled) {
        setState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          canInstall: false 
        }));
        setInstallPrompt(null);
      }
      
      return isInstalled;
    } catch (error) {
      console.error('Installation failed', error);
      return false;
    }
  };

  // Update the service worker
  const updateServiceWorker = () => {
    if (!swUpdate.waiting) {
      // Check for updates manually
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.update();
          });
        });
      }
      return;
    }

    // Send message to waiting SW to skip waiting
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page after SW activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  };

  // Clear app cache
  const clearCache = async (): Promise<boolean> => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      setState(prev => ({ ...prev, cacheStatus: 'ready' }));
      return true;
    } catch (error) {
      console.error('Failed to clear cache', error);
      return false;
    }
  };

  // Get cache statistics
  const getCacheStats = async () => {
    if (!('caches' in window)) return null;

    try {
      const cacheNames = await caches.keys();
      const stats = await Promise.all(
        cacheNames.map(async name => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, entries: keys.length };
        })
      );
      
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats', error);
      return null;
    }
  };

  return {
    ...state,
    updateAvailable: swUpdate.available,
    installApp,
    updateServiceWorker,
    clearCache,
    getCacheStats,
    refreshNetworkInfo: checkNetworkSpeed,
    refreshStorageInfo: checkStorageUsage
  };
}

// Helper functions
function getNetworkSpeedLabel(effectiveType: string): string {
  const speedMap: { [key: string]: string } = {
    'slow-2g': 'very-slow',
    '2g': 'slow',
    '3g': 'medium',
    '4g': 'fast'
  };
  
  return speedMap[effectiveType] || 'unknown';
}

// Service worker message handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      // Handle cache update notifications
      console.log('Cache updated for:', event.data.url);
    }
  });
}