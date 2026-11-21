'use client';

import { useState } from 'react';
import { LandingPage } from '../components/LandingPage';
import { AuthPage } from '../components/AuthPage';
import { HomePage } from '../components/HomePage';
import { UserProfile } from '../types/quran';
import { Language } from '../i18n/translations';

export default function Page() {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'landing' | 'auth' | 'home'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<UserProfile | null>(null);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  if (view === 'landing' && !user) {
    return (
      <LandingPage
        lang={lang}
        onToggleLang={toggleLanguage}
        onNavigateAuth={(mode) => {
          setAuthInitialMode(mode);
          setView('auth');
        }}
      />
    );
  }

  if (!user || view === 'auth') {
    return (
      <AuthPage
        lang={lang}
        initialMode={authInitialMode}
        onToggleLang={toggleLanguage}
        onAuthenticated={(loggedInUser) => {
          setUser(loggedInUser);
          setView('home');
        }}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  return (
    <HomePage
      lang={lang}
      onToggleLang={toggleLanguage}
      user={user}
      onLogout={() => {
        setUser(null);
        setView('landing');
      }}
    />
  );
}
