import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { VersionFooter } from './components/VersionFooter';

type Props = {
  children: React.ReactNode;
  statusBar?: 'light' | 'dark' | 'auto';
};

/** Full-screen content with version strip at the bottom (like nifgashim status bar). */
export const AppShell: React.FC<Props> = ({ children, statusBar = 'light' }) => (
  <View style={styles.root}>
    <StatusBar style={statusBar} />
    <View style={styles.main}>{children}</View>
    <VersionFooter />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
});