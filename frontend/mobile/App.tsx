import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { AuthScreen, MobileUser } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { COLORS } from './src/theme/colors';
import { MobileLanguage } from './src/i18n/translations';

export default function App() {
  const [lang, setLang] = useState<MobileLanguage>('en');
  const [user, setUser] = useState<MobileUser | null>(null);

  const [fontsLoaded] = useFonts({
    'Tajawal': require('./assets/Tajawal/Tajawal-Regular.ttf'),
    'Tajawal-Regular': require('./assets/Tajawal/Tajawal-Regular.ttf'),
    'Tajawal-Medium': require('./assets/Tajawal/Tajawal-Medium.ttf'),
    'Tajawal-Bold': require('./assets/Tajawal/Tajawal-Bold.ttf'),
    'Tajawal-Light': require('./assets/Tajawal/Tajawal-Light.ttf'),
    'Tajawal-ExtraBold': require('./assets/Tajawal/Tajawal-ExtraBold.ttf'),
    'Tajawal-Black': require('./assets/Tajawal/Tajawal-Black.ttf'),
    'Amiri': require('./assets/Amiri/Amiri-Regular.ttf'),
    'Amiri-Regular': require('./assets/Amiri/Amiri-Regular.ttf'),
    'Amiri-Bold': require('./assets/Amiri/Amiri-Bold.ttf'),
    'Amiri-Italic': require('./assets/Amiri/Amiri-Italic.ttf'),
    'Amiri-BoldItalic': require('./assets/Amiri/Amiri-BoldItalic.ttf'),
  });

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      {!user ? (
        <AuthScreen
          lang={lang}
          onToggleLang={toggleLanguage}
          onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
        />
      ) : (
        <HomeScreen
          lang={lang}
          onToggleLang={toggleLanguage}
          user={user}
          onLogout={() => setUser(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 28) + 10) : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
