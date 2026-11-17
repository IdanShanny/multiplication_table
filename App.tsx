import React, { useState, useEffect } from 'react';
import { View, StyleSheet, I18nManager, Platform } from 'react-native';
import { AppShell } from './src/AppShell';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { ParentsGuideScreen } from './src/screens/ParentsGuideScreen';
import { CharacterScreen } from './src/screens/CharacterScreen';
import { AppData, User } from './src/types';
import { loadAppData, saveUser, clearAllData } from './src/storage';
import { FEATURE_CHARACTER } from './src/features';
import { syncAnalyticsOnAppLoad, syncAnalyticsOnRegister } from './src/analytics';

// Enable RTL for Hebrew
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type Screen = 'loading' | 'registration' | 'practice' | 'parentsGuide' | 'report' | 'character';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [appData, setAppData] = useState<AppData | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'he');
    }
  }, []);

  const loadInitialData = async () => {
    const data = await loadAppData();
    setAppData(data);
    setScreen(data.user ? 'practice' : 'registration');
    void syncAnalyticsOnAppLoad(data);
  };

  const handleRegister = async (user: User) => {
    const data = await saveUser(user);
    setAppData(data);
    setScreen('practice');
    void syncAnalyticsOnRegister(user, data);
  };

  const handleDataUpdate = (data: AppData) => {
    setAppData(data);
  };

  const handleShowParentsGuide = () => {
    setScreen('parentsGuide');
  };

  const handleShowReport = () => {
    setScreen('report');
  };

  const handleShowCharacter = () => {
    setScreen('character');
  };

  const handleBackToPractice = async () => {
    const data = await loadAppData();
    setAppData(data);
    setScreen('practice');
  };

  const handleResetAllData = async () => {
    await clearAllData();
    const data = await loadAppData();
    setAppData(data);
    setScreen('registration');
  };

  if (screen === 'loading' || !appData) {
    return (
      <AppShell>
        <View style={styles.container} />
      </AppShell>
    );
  }

  if (screen === 'registration') {
    return (
      <AppShell>
        <RegistrationScreen onRegister={handleRegister} />
      </AppShell>
    );
  }

  if (screen === 'parentsGuide' && appData.user) {
    return (
      <AppShell>
        <ParentsGuideScreen
          user={appData.user}
          onBack={handleBackToPractice}
          onShowReport={handleShowReport}
          onResetAllData={handleResetAllData}
        />
      </AppShell>
    );
  }

  if (screen === 'report' && appData.user) {
    return (
      <AppShell>
        <ReportScreen
          user={appData.user}
          appData={appData}
          onBack={handleBackToPractice}
        />
      </AppShell>
    );
  }

  if (screen === 'character' && appData.user && FEATURE_CHARACTER) {
    return (
      <AppShell>
        <CharacterScreen user={appData.user} onBack={handleBackToPractice} />
      </AppShell>
    );
  }

  if (appData.user) {
    return (
      <AppShell>
        <PracticeScreen
          user={appData.user}
          appData={appData}
          onDataUpdate={handleDataUpdate}
          onShowParentsGuide={handleShowParentsGuide}
          onShowCharacter={FEATURE_CHARACTER ? handleShowCharacter : undefined}
        />
      </AppShell>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e74c3c',
  },
});

