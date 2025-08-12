import { useState, useEffect } from 'react';

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  subscription: PushSubscription | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
    subscription: null
  });

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    setState(prev => ({
      ...prev,
      permission: isSupported ? Notification.permission : 'denied',
      isSupported
    }));

    if (isSupported) {
      // Check for existing subscription
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({ ...prev, subscription }));
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID key for push notifications
      const vapidPublicKey = await getVapidPublicKey();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setState(prev => ({ ...prev, subscription }));
      
      // Send subscription to server
      await sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.subscription) {
      return true;
    }

    try {
      const success = await state.subscription.unsubscribe();
      
      if (success) {
        setState(prev => ({ ...prev, subscription: null }));
        // Remove subscription from server
        await removeSubscriptionFromServer(state.subscription);
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  const scheduleHabitReminder = async (habitId: string, reminderTime: string, habitName: string) => {
    if (!state.subscription) {
      console.warn('No push subscription available');
      return;
    }

    try {
      await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          habitId,
          reminderTime,
          habitName,
          subscription: state.subscription
        })
      });
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!state.subscription) {
      console.warn('No push subscription available');
      return;
    }

    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: state.subscription })
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    ...state,
    isGranted: state.permission === 'granted',
    isDenied: state.permission === 'denied',
    isSubscribed: !!state.subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    scheduleHabitReminder,
    sendTestNotification
  };
}

// Helper functions
async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await fetch('/api/notifications/vapid-key', {
      credentials: 'include'
    });
    const { publicKey } = await response.json();
    return publicKey;
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    // Fallback VAPID key for development
    return 'BCryqjhOW2CxKARP-2MuXPvyj7EJ3FgdvAr1_Lev8OWKi16x8Zz_FZp8xJJHyy1YHxKNYrKnWJrWJsWCcj6M7cQ';
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subscription })
    });
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription) {
  try {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subscription })
    });
  } catch (error) {
    console.error('Error removing subscription from server:', error);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}