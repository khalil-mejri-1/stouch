import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';

import { TransactionsProvider } from '../context/TransactionsContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '../context/ThemeContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const { width } = Dimensions.get('window');

function RootNavigator() {
  const { isDark, colors } = useTheme();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit-Regular': require('../assets/fonts/Outfit_400Regular.ttf'),
    'Outfit-Medium': require('../assets/fonts/Outfit_500Medium.ttf'),
    'Outfit-SemiBold': require('../assets/fonts/Outfit_600SemiBold.ttf'),
    'Outfit-Bold': require('../assets/fonts/Outfit_700Bold.ttf'),
    'Outfit-ExtraBold': require('../assets/fonts/Outfit_800ExtraBold.ttf'),
    'Outfit-Black': require('../assets/fonts/Outfit_900Black.ttf'),
  });

  useEffect(() => {
    // Hide the native splash screen safely once JS is running
    SplashScreen.hideAsync().catch(() => {});

    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / 1600, 1);
      setProgress(pct);
      if (pct >= 1 && (fontsLoaded || fontError)) {
        clearInterval(interval);
        setIsSplashVisible(false);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [fontsLoaded, fontError]);

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      {/* Stack is ALWAYS mounted to preserve navigation state and prevent native Android Fragment crashes */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="record" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="income" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="expenses" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="add-transaction" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Custom Splash Screen Overlay - Rendered over Stack until loading finishes without unmounting Stack */}
      {isSplashVisible && (
        <LinearGradient
          colors={isDark ? ['#080C15', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          style={[styles.splashOverlay, { backgroundColor: colors.background }]}
          pointerEvents="none"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <LanguageProvider>
        <TransactionsProvider>
          <RootNavigator />
        </TransactionsProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashOverlay: {
    ...(StyleSheet.absoluteFill as any),
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    width: width * 0.5,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37', // Gold color matching logo accents
    borderRadius: 3,
  },
});
