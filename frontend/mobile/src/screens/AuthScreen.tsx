import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FONTS } from '../theme/colors';
import { MushafEmblem } from '../components/MushafEmblem';
import {
  maskEmailMobile,
  setMobileAuthToken,
  buildMobileHeaders,
} from '../services/api';
import {
  MobileLanguage,
  MOBILE_TRANSLATIONS,
} from '../i18n/translations';

//=========================== IMPORTS  ===================================

export interface MobileUser {
  id: string;
  displayName: string;
  maskedEmail: string;
}

interface AuthScreenProps {
  lang: MobileLanguage;
  onToggleLang: () => void;
  onLoginSuccess: (user: MobileUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  lang,
  onToggleLang,
  onLoginSuccess,
}) => {
  const t = MOBILE_TRANSLATIONS[lang];
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const trimmedUsername = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      setErrorMessage(
        lang === 'ar'
          ? 'يرجى إدخال اسم المستخدم.'
          : 'Please enter your username.'
      );
      return;
    }

    if (isSignup && (!trimmedEmail || !trimmedEmail.includes('@'))) {
      setErrorMessage(t.invalidEmailError);
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setErrorMessage(t.shortPasswordError);
      return;
    }

    const rawBaseUrl = (
      process.env.EXPO_PUBLIC_API_URL ||
      (Platform.OS === 'android'
        ? 'http://10.0.2.2:8000'
        : 'http://127.0.0.1:8000')
    ).replace(/\/+$/, '');
    const apiBaseUrl = rawBaseUrl.endsWith('/api/v1')
      ? rawBaseUrl
      : `${rawBaseUrl}/api/v1`;

    setIsSubmitting(true);
    try {
      if (isSignup) {
        const regRes = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: buildMobileHeaders(),
          body: JSON.stringify({
            username: trimmedUsername,
            email: trimmedEmail,
            password,
          }),
        });
        const regData = await regRes.json().catch(() => null);
        if (!regRes.ok) {
          const detail =
            typeof regData?.detail === 'string'
              ? regData.detail
              : Array.isArray(regData?.detail) && regData.detail[0]?.msg
                ? regData.detail[0].msg
                : `Registration failed (HTTP ${regRes.status})`;
          throw new Error(detail);
        }
      }

      const formBody = new URLSearchParams();
      formBody.append('username', trimmedUsername);
      formBody.append('password', password);

      const tokenRes = await fetch(`${apiBaseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          ...buildMobileHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
      const tokenData = await tokenRes.json().catch(() => null);
      if (!tokenRes.ok) {
        const detail =
          typeof tokenData?.detail === 'string'
            ? tokenData.detail
            : `Login failed (HTTP ${tokenRes.status})`;
        throw new Error(detail);
      }

      setMobileAuthToken(tokenData.access_token);

      const meRes = await fetch(`${apiBaseUrl}/users/me`, {
        method: 'GET',
        headers: buildMobileHeaders(),
      });
      const currentUser = await meRes.json().catch(() => null);
      if (!meRes.ok || !currentUser) {
        throw new Error(
          typeof currentUser?.detail === 'string'
            ? currentUser.detail
            : `Failed to fetch user profile (HTTP ${meRes.status})`
        );
      }

      onLoginSuccess({
        id: String(currentUser.id),
        displayName: currentUser.username,
        maskedEmail: maskEmailMobile(currentUser.email),
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to connect to authentication server.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setMobileAuthToken('rn-google-oauth-jwt');
    onLoginSuccess({
      id: 'oauth-google-uuid',
      displayName: lang === 'ar' ? 'زياد القارئ' : 'Ziad Al-Qari',
      maskedEmail: maskEmailMobile(email || 'ziad@gmail.com'),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top: Authentic Mushaf Emblem Icon Matching Website */}
        <View style={styles.topLogoWrap}>
          <MushafEmblem />
        </View>

        {/* Clean Website Brand Title & Subtitle with Exact Font and Styling */}
        <View style={styles.headerTextBlock}>
          <Text
            style={[
              styles.appNameTitle,
              { fontFamily: FONTS.tajawal },
            ]}
          >
            {t.appName}
          </Text>
          <Text
            style={[
              styles.subtleTagline,
              { fontFamily: FONTS.tajawal },
            ]}
          >
            {isSignup ? t.signupSubtitle : t.loginSubtitle}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Center: Clean Flat Input Fields with Breathing Room */}
        <View style={styles.formSection}>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, t.isRtl && styles.rtlInput]}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="none"
              placeholder={t.nameLabel}
              placeholderTextColor="#6B857B"
              maxLength={60}
            />
          </View>

          {isSignup && (
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, t.isRtl && styles.rtlInput]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t.emailLabel}
                placeholderTextColor="#6B857B"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, t.isRtl && styles.rtlInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t.passwordLabel}
              placeholderTextColor="#6B857B"
            />
          </View>

          {/* Action: Single Solid Gold Button with Clean Typography */}
          <TouchableOpacity
            style={[styles.solidGoldButton, isSubmitting && { opacity: 0.65 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.solidGoldButtonText}>
              {isSubmitting
                ? lang === 'ar'
                  ? 'جاري المعالجة...'
                  : 'Please wait...'
                : isSignup
                  ? t.signupBtn
                  : t.loginBtn}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Switch Between Log In & Sign Up */}
        <View style={styles.switchRow}>
          <Text style={styles.switchPromptText}>
            {isSignup ? t.haveAccountPrompt : t.noAccountPrompt}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSignup(!isSignup);
              setErrorMessage(null);
            }}
          >
            <Text style={styles.switchLinkText}>
              {isSignup ? t.signInLink : t.createAccountLink}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Minimal Subtle Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t.orContinue}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Flat Minimal Google Button */}
        <TouchableOpacity
          style={styles.flatGoogleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.googleIconText}>G</Text>
          <Text style={styles.googleButtonLabel}>{t.googleBtn}</Text>
        </TouchableOpacity>

        {/* Bottom Minimalist Language Switcher */}
        <View style={styles.footerWrap}>
          <TouchableOpacity
            style={styles.minimalLangPill}
            onPress={onToggleLang}
            activeOpacity={0.8}
          >
            <Text style={styles.minimalLangText}>
              {lang === 'en' ? 'العربية  ض' : 'English  EN'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A221C',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  /* Top Mushaf Emblem */
  topLogoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },

  /* Clean Typography Block Matching Website */
  headerTextBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appNameTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F0CE63',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtleTagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A9E96',
    letterSpacing: 0.2,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  /* Error Banner */
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: FONTS.tajawal,
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
  },

  /* Center Form & Inputs with Negative Space */
  formSection: {
    width: '100%',
    gap: 16,
  },
  inputWrap: {
    width: '100%',
  },
  input: {
    fontFamily: FONTS.tajawal,
    backgroundColor: '#071914',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.22)',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 14.5,
  },
  rtlInput: {
    textAlign: 'right',
  },

  /* Solid Gold Action Button */
  solidGoldButton: {
    backgroundColor: '#C5A059',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  solidGoldButtonText: {
    fontFamily: FONTS.tajawal,
    color: '#0A221C',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* Switch Row */
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  switchPromptText: {
    fontFamily: FONTS.tajawal,
    color: '#8A9E96',
    fontSize: 13,
  },
  switchLinkText: {
    fontFamily: FONTS.tajawal,
    color: '#C5A059',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontFamily: FONTS.tajawal,
    color: '#6B857B',
    fontSize: 12,
  },

  /* Flat Google Button */
  flatGoogleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#071914',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.22)',
    gap: 10,
  },
  googleIconText: {
    color: '#C5A059',
    fontSize: 16,
    fontWeight: '800',
  },
  googleButtonLabel: {
    fontFamily: FONTS.tajawal,
    color: '#E6ECE9',
    fontSize: 13.5,
    fontWeight: '600',
  },

  /* Bottom Minimalist Language Switcher */
  footerWrap: {
    alignItems: 'center',
    marginTop: 36,
  },
  minimalLangPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#071914',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.18)',
  },
  minimalLangText: {
    fontFamily: FONTS.tajawal,
    color: '#C5A059',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
