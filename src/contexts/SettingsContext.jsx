import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    read_receipts_enabled: true,
    online_status_visible: true,
    typing_indicators_enabled: true,
    notifications_enabled: true,
    sound_alerts_enabled: true,
    auto_download_media: true,
    max_auto_download_size: 10,
    theme: 'system',
    chat_background: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await settingsAPI.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = await settingsAPI.updateUserSettings(newSettings);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const updateSetting = async (setting, value) => {
    try {
      const response = await settingsAPI.updateSetting(setting, value);
      setSettings(response.settings);
      return response.settings;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updateSetting,
    loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};