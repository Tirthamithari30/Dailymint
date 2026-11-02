import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, NotificationSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  settings: NotificationSettings | null;
  unreadCount: number;
  markAllAsRead: () => void;
  updateSettings: (data: Partial<NotificationSettings>) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadNotifications = async () => {
      try {
        const [feedRes, settingsRes] = await Promise.allSettled([
          api.getNotificationFeed(),
          api.getNotificationSettings(),
        ]);
        if (feedRes.status === 'fulfilled') {
          setNotifications(feedRes.value.notifications);
        }
        if (settingsRes.status === 'fulfilled') {
          setSettings(settingsRes.value.settings);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    loadNotifications();
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const updateSettings = async (data: Partial<NotificationSettings>) => {
    const res = await api.updateNotificationSettings(data);
    setSettings(res.settings);
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('DailyMint Notifications Enabled', {
        body: 'You will receive real-time updates on your safe daily spending budget!',
        icon: '/icon-192.png',
      });
      return true;
    }
    return false;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        settings,
        unreadCount,
        markAllAsRead,
        updateSettings,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
