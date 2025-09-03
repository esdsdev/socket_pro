// Notification utilities
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  localStorage.setItem('notificationPermission', permission);
  return permission === 'granted';
};

export const isTabActive = () => {
  return document.visibilityState === 'visible';
};

export const displayBrowserNotification = (title, body, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'chat-message',
    requireInteraction: false,
    ...options
  };

  const notification = new Notification(title, {
    body,
    ...defaultOptions
  });

  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  return notification;
};

export const getNotificationPermission = () => {
  return localStorage.getItem('notificationPermission') || 'default';
};