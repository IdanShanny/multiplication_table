import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, I18nManager } from 'react-native';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { ParentsGuideScreen } from './src/screens/ParentsGuideScreen';
import { CharacterScreen } from './src/screens/CharacterScreen';
import { AppData, User } from './src/types';
import { loadAppData, saveUser } from './src/storage';

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

  const loadInitialData = async () => {
    const data = await loadAppData();
    setAppData(data);
    setScreen(data.user ? 'practice' : 'registration');
  };

  const handleRegister = async (user: User) => {
    const data = await saveUser(user);
    setAppData(data);
    setScreen('practice');
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

  if (screen === 'loading' || !appData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === 'registration') {
    return (
      <>
        <StatusBar style="light" />
        <RegistrationScreen onRegister={handleRegister} />
      </>
    );
  }

  if (screen === 'parentsGuide' && appData.user) {
    return (
      <>
        <StatusBar style="light" />
        <ParentsGuideScreen
          user={appData.user}
          onBack={handleBackToPractice}
          onShowReport={handleShowReport}
        />
      </>
    );
  }

  if (screen === 'report' && appData.user) {
    return (
      <>
        <StatusBar style="light" />
        <ReportScreen
          user={appData.user}
          appData={appData}
          onBack={handleBackToPractice}
        />
      </>
    );
  }

  if (screen === 'character' && appData.user) {
    return (
      <>
        <StatusBar style="light" />
        <CharacterScreen
          user={appData.user}
          onBack={handleBackToPractice}
        />
      </>
    );
  }

  if (appData.user) {
    return (
      <>
        <StatusBar style="light" />
        <PracticeScreen
          user={appData.user}
          appData={appData}
          onDataUpdate={handleDataUpdate}
          onShowParentsGuide={handleShowParentsGuide}
          onShowCharacter={handleShowCharacter}
        />
      </>
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

