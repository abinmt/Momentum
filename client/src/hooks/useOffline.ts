import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored - triggering sync');
      
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return (registration as any).sync.register('background-sync');
        }).catch(error => {
          console.error('Background sync registration failed:', error);
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - entering offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending offline actions
    checkOfflineQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOfflineQueue = async () => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['offline_actions'], 'readonly');
      const store = transaction.objectStore('offline_actions');
      
      const request = store.getAll();
      request.onsuccess = () => {
        setOfflineQueue(request.result || []);
      };
    } catch (error) {
      console.error('Failed to check offline queue:', error);
    }
  };

  const openOfflineDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('momentum-offline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const addOfflineAction = async (action: any) => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['offline_actions'], 'readwrite');
      const store = transaction.objectStore('offline_actions');
      
      await store.add({
        ...action,
        timestamp: Date.now()
      });
      
      await checkOfflineQueue();
    } catch (error) {
      console.error('Failed to add offline action:', error);
    }
  };

  const clearOfflineQueue = async () => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['offline_actions'], 'readwrite');
      const store = transaction.objectStore('offline_actions');
      
      await store.clear();
      setOfflineQueue([]);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  };

  return {
    isOnline,
    isOffline: !isOnline,
    offlineQueue,
    queueLength: offlineQueue.length,
    addOfflineAction,
    clearOfflineQueue,
    refreshQueue: checkOfflineQueue
  };
}