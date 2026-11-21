'use client';

import React, { useState } from 'react';
import {
  maskEmailAddress,
  validatePasswordStrength,
  setInMemoryToken,
  buildRoadmapHeaders,
} from '../services/api';
import { UserProfile } from '../types/quran';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { quranKareemCalligraphyUrl } from '../data/assets';

interface AuthPageProps {
  lang: Language;
  initialMode?: 'login' | 'signup';
  onToggleLang: () => void;
  onAuthenticated: (user: UserProfile) => void;
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  lang,
  initialMode = 'login',
  onToggleLang,
  onAuthenticated,
  onBackToLanding,
}) => {
  const t = TRANSLATIONS[lang];
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      setErrorMessage(t.shortPasswordError);
      return;
    }

    const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(
      /\/+$/,
      ''
    );
    const apiBaseUrl = rawBaseUrl
      ? rawBaseUrl.endsWith('/api/v1')
        ? rawBaseUrl
        : `${rawBaseUrl}/api/v1`
      : '/api/v1';

    setIsSubmitting(true);
    try {
      if (isSignup) {
        const regRes = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: buildRoadmapHeaders(),
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
          ...buildRoadmapHeaders(),
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

      setInMemoryToken(tokenData.access_token);

      const meRes = await fetch(`${apiBaseUrl}/users/me`, {
        method: 'GET',
        headers: buildRoadmapHeaders(),
      });
      const currentUser = await meRes.json().catch(() => null);
      if (!meRes.ok || !currentUser) {
        throw new Error(
          typeof currentUser?.detail === 'string'
            ? currentUser.detail
            : `Failed to fetch user profile (HTTP ${meRes.status})`
        );
      }

      onAuthenticated({
        id: String(currentUser.id),
        displayName: currentUser.username,
        maskedEmail: maskEmailAddress(currentUser.email),
        plan: 'premium',
        favoriteQari: 'Mishary Rashid Alafasy',
        visibility: 'public',
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
    setInMemoryToken('google-oauth-ephemeral-jwt');
    onAuthenticated({
      id: 'google-oauth-user-id',
      displayName: lang === 'ar' ? 'زياد القارئ' : 'Ziad Al-Qari',
      maskedEmail: maskEmailAddress(email || 'ziad@gmail.com'),
      plan: 'premium',
      favoriteQari: 'Mishary Rashid Alafasy',
      visibility: 'public',
    });
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-6 bg-[#061713] font-tajawal text-ivory"
      dir={t.dir}
    >
      {/* Authentic Moroccan Poly-Lobed (Muqarnas / Lambrequin) Mihrab & Gebs Stucco Carvings */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <svg
          className="w-full h-full block"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 1. Intricate Vertical Moroccan Tawriq (Floral Arabesque) Pillar Border */}
            <pattern
              id="moroccan-tawriq-border"
              x="0"
              y="0"
              width="76"
              height="110"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="4"
                y="0"
                width="68"
                height="110"
                fill="#061612"
                stroke="#D4AF37"
                strokeOpacity="0.48"
                strokeWidth="1.5"
              />
              <rect
                x="10"
                y="0"
                width="56"
                height="110"
                stroke="#D4AF37"
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <path
                d="M38 6
                   C56 16, 62 36, 48 52
                   C58 62, 60 82, 38 104
                   C16 82, 18 62, 28 52
                   C14 36, 20 16, 38 6 Z"
                stroke="#F0CE63"
                strokeOpacity="0.65"
                strokeWidth="1.6"
                fill="#D4AF37"
                fillOpacity="0.1"
              />
              <path
                d="M38 22 C48 32, 48 46, 38 55 C28 46, 28 32, 38 22 Z"
                fill="#E5C158"
                fillOpacity="0.35"
              />
              <path
                d="M22 55 C28 48, 48 48, 54 55 C48 62, 28 62, 22 55 Z"
                stroke="#F0CE63"
                strokeOpacity="0.6"
                strokeWidth="1.2"
              />
              <circle
                cx="38"
                cy="80"
                r="5"
                stroke="#F0CE63"
                strokeOpacity="0.65"
                strokeWidth="1.3"
              />
            </pattern>

            {/* Corner Quarter-Shamsa Medallion for Bottom Left & Right */}
            <g id="corner-moroccan-medallion">
              <path
                d="M 0 -310
                   C 45 -308, 75 -285, 92 -255
                   C 130 -258, 162 -232, 172 -195
                   C 210 -190, 238 -162, 245 -122
                   C 280 -108, 305 -72, 310 0
                   L 0 0 Z"
                fill="#071B15"
                stroke="url(#gold-arch-stroke)"
                strokeWidth="2.4"
              />
              <path
                d="M 0 -278
                   C 38 -275, 65 -255, 80 -228
                   C 114 -230, 142 -208, 150 -174
                   C 184 -168, 210 -142, 216 -108
                   C 248 -95, 272 -62, 276 0"
                stroke="#E5C158"
                strokeOpacity="0.55"
                strokeWidth="1.4"
              />
              {[15, 35, 55, 75].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 C 25 -85, 35 -180, 0 -255 C -35 -180, -25 -85, 0 0 Z"
                  transform={`rotate(${deg})`}
                  stroke="#F0CE63"
                  strokeOpacity="0.45"
                  strokeWidth="1.3"
                  fill="#D4AF37"
                  fillOpacity="0.08"
                />
              ))}
            </g>

            {/* Sanctuary Center Emerald-Teal Glow */}
            <radialGradient id="sanctuary-center-glow" cx="50%" cy="22%" r="60%">
              <stop offset="0%" stopColor="#1B5E4B" stopOpacity="0.68" />
              <stop offset="48%" stopColor="#0B2B22" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#04110D" stopOpacity="1" />
            </radialGradient>

            {/* Warm Golden Bottom Ambient Glow */}
            <radialGradient id="bottom-gold-glow" cx="72%" cy="92%" r="42%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#05120E" stopOpacity="0" />
            </radialGradient>

            {/* Metallic Gold Gradient for the Mihrab Arch Outline */}
            <linearGradient id="gold-arch-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE89E" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9A781C" />
            </linearGradient>
          </defs>

          <rect width="1920" height="1080" fill="#061713" />

          {/* Left & Right Vertical Carved Moroccan Tawriq Borders */}
          <rect x="18" y="0" width="76" height="1080" fill="url(#moroccan-tawriq-border)" />
          <rect x="1826" y="0" width="76" height="1080" fill="url(#moroccan-tawriq-border)" />

          {/* Authentic Moroccan Poly-Lobed Mihrab Arch */}
          <path
            d="M 380 1080
               L 380 655
               C 340 605, 345 520, 415 480
               L 432 472
               C 385 415, 405 320, 480 285
               L 496 277
               C 462 215, 495 125, 572 98
               L 588 92
               C 568 42, 602 8, 665 0
               L 1255 0
               C 1318 8, 1352 42, 1332 92
               L 1348 98
               C 1425 125, 1458 215, 1424 277
               L 1440 285
               C 1515 320, 1535 415, 1488 472
               L 1505 480
               C 1575 520, 1580 605, 1540 655
               L 1540 1080 Z"
            fill="url(#sanctuary-center-glow)"
            stroke="url(#gold-arch-stroke)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Double-Rim Contour */}
          <path
            d="M 402 1080
               L 402 660
               C 365 612, 370 532, 435 494
               L 450 486
               C 408 430, 426 338, 498 304
               L 514 296
               C 482 235, 514 148, 588 120
               L 604 114
               C 586 64, 618 26, 678 16
               L 1242 16
               C 1302 26, 1334 64, 1316 114
               L 1332 120
               C 1406 148, 1438 235, 1406 296
               L 1422 304
               C 1494 338, 1512 430, 1470 486
               L 1485 494
               C 1550 532, 1555 612, 1518 660
               L 1518 1080"
            stroke="#E5C158"
            strokeOpacity="0.42"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          <g
            stroke="#E5C158"
            strokeOpacity="0.45"
            strokeWidth="1.3"
            fill="#D4AF37"
            fillOpacity="0.12"
          >
            <circle cx="422" cy="476" r="6" />
            <circle cx="488" cy="281" r="6" />
            <circle cx="580" cy="95" r="6" />
            <circle cx="1498" cy="476" r="6" />
            <circle cx="1432" cy="281" r="6" />
            <circle cx="1340" cy="95" r="6" />
          </g>

          <rect width="1920" height="1080" fill="url(#bottom-gold-glow)" />

          <use href="#corner-moroccan-medallion" transform="translate(0, 1080)" />
          <use
            href="#corner-moroccan-medallion"
            transform="translate(1920, 1080) scale(-1, 1)"
          />
        </svg>
      </div>

      {/* Main Centered Stage */}
      <main className="relative z-10 w-full max-w-[440px] flex flex-col items-center gap-6">
        {/* Big Illuminated Golden Quran Icon & App Title */}
        <div className="flex items-center justify-center gap-4 mb-1">
          <div
            className="flex items-center justify-center drop-shadow-[0_6px_18px_rgba(212,175,55,0.4)]"
            aria-hidden="true"
          >
            <svg
              width="68"
              height="76"
              viewBox="0 0 66 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mushaf-gold" x1="0" y1="0" x2="66" y2="74">
                  <stop offset="0%" stopColor="#FFE89E" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#9A7418" />
                </linearGradient>
              </defs>
              <rect
                x="8"
                y="6"
                width="50"
                height="58"
                rx="6"
                fill="url(#mushaf-gold)"
                stroke="#FFF3C4"
                strokeWidth="1.5"
              />
              <rect
                x="13"
                y="11"
                width="40"
                height="46"
                rx="3"
                stroke="#071B15"
                strokeOpacity="0.7"
                strokeWidth="1.3"
              />
              <image
                href={quranKareemCalligraphyUrl}
                x="16"
                y="16"
                width="34"
                height="34"
                preserveAspectRatio="xMidYMid meet"
              />
              <path
                d="M10 60 C10 57 14 57 16 57 L56 57 L56 64 L14 64 C11 64 10 62 10 60 Z"
                fill="#0A231C"
                stroke="#E5C158"
                strokeWidth="1.3"
              />
              <path d="M18 63 L18 71 L22 68 L26 71 L26 63 Z" fill="#E5C158" />
            </svg>
          </div>

          <h1 className="font-amiri text-[2.9rem] font-bold tracking-[0.02em] leading-[1.08] bg-gradient-to-b from-[#FFF3B8] via-[#E6C35C] to-[#BA9228] bg-clip-text text-transparent drop-shadow-[0_4px_22px_rgba(212,175,55,0.28)] m-0">
            {t.appName}
          </h1>
        </div>

        {/* Translucent Dark Emerald Login / Signup Card */}
        <div className="w-full bg-[#081C17]/75 backdrop-blur-md border border-[#D4AF37]/30 rounded-[22px] px-7 pt-6 pb-7 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          {/* Top Mode Tabs */}
          <div className="grid grid-cols-2 border-b border-white/10 mb-5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              className={`bg-transparent border-0 border-b-2 py-2.5 px-2 font-tajawal text-[0.95rem] cursor-pointer transition ${
                !isSignup
                  ? 'text-ivory font-bold border-[#F0CE63]'
                  : 'text-sage font-medium border-transparent hover:text-ivory'
              }`}
              onClick={() => {
                setIsSignup(false);
                setErrorMessage(null);
              }}
            >
              {t.loginTitle}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={`bg-transparent border-0 border-b-2 py-2.5 px-2 font-tajawal text-[0.95rem] cursor-pointer transition ${
                isSignup
                  ? 'text-ivory font-bold border-[#F0CE63]'
                  : 'text-sage font-medium border-transparent hover:text-ivory'
              }`}
              onClick={() => {
                setIsSignup(true);
                setErrorMessage(null);
              }}
            >
              {t.signupTitle}
            </button>
          </div>

          {errorMessage && (
            <div
              className="bg-red-400/15 border border-red-400 text-red-100 rounded-xl p-3 text-sm text-center mb-4 font-tajawal"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
            <input
              type="text"
              className="w-full bg-[#102A22]/75 border border-[#D4AF37]/50 rounded-xl px-4 py-3.5 text-ivory font-tajawal text-[0.95rem] placeholder:text-sage/80 focus:outline-none focus:border-[#F0CE63] focus:bg-[#14342A]/95 focus:ring-2 focus:ring-[#D4AF37]/20 transition"
              required
              maxLength={60}
              autoComplete="username"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.nameLabel}
            />

            {isSignup && (
              <input
                type="email"
                className="w-full bg-[#102A22]/75 border border-[#D4AF37]/50 rounded-xl px-4 py-3.5 text-ivory font-tajawal text-[0.95rem] placeholder:text-sage/80 focus:outline-none focus:border-[#F0CE63] focus:bg-[#14342A]/95 focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailLabel}
              />
            )}

            <input
              type="password"
              className="w-full bg-[#102A22]/75 border border-[#D4AF37]/50 rounded-xl px-4 py-3.5 text-ivory font-tajawal text-[0.95rem] placeholder:text-sage/80 focus:outline-none focus:border-[#F0CE63] focus:bg-[#14342A]/95 focus:ring-2 focus:ring-[#D4AF37]/20 transition"
              required
              minLength={8}
              maxLength={128}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordLabel}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1.5 bg-gradient-to-b from-[#0E2820]/95 to-[#081914]/98 border border-[#D4AF37]/85 text-[#F0CE63] rounded-full py-3.5 px-5 font-tajawal text-[0.96rem] font-bold cursor-pointer transition hover:border-[#FFE89E] hover:text-[#FFF5CC] hover:shadow-[0_0_22px_rgba(212,175,55,0.28)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? lang === 'ar'
                  ? 'جاري المعالجة...'
                  : 'Please wait...'
                : isSignup
                  ? t.signupBtn
                  : t.loginBtn}
            </button>
          </form>

          {/* Bottom prompt under the button */}
          <div className="mt-3.5 text-center text-[0.83rem] text-sage font-tajawal">
            <span>{isSignup ? t.haveAccountPrompt : t.noAccountPrompt}</span>{' '}
            <button
              type="button"
              className="bg-transparent border-0 text-[#F0CE63] font-bold underline cursor-pointer font-tajawal text-[0.83rem] px-1 hover:text-[#FFF5CC]"
              onClick={() => {
                setIsSignup(!isSignup);
                setErrorMessage(null);
              }}
            >
              {isSignup ? t.signInLink : t.createAccountLink}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4 text-sage text-[0.76rem] font-tajawal before:content-[''] before:flex-1 before:h-px before:bg-white/10 after:content-[''] after:flex-1 after:h-px after:bg-white/10">
            <span>{t.orContinue}</span>
          </div>

          {/* Single Google Login Pill Button (Dark Emerald + Gold Logo) */}
          <button
            type="button"
            className="w-full bg-gradient-to-b from-[#0E2820]/95 to-[#081914]/98 text-[#F0CE63] border border-[#D4AF37]/85 rounded-full py-3 px-5 font-tajawal text-[0.94rem] font-bold flex items-center justify-center gap-3 cursor-pointer transition hover:border-[#FFE89E] hover:text-[#FFF5CC] hover:shadow-[0_0_22px_rgba(212,175,55,0.28)]"
            onClick={handleGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="google-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE89E" />
                  <stop offset="55%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#9A7418" />
                </linearGradient>
              </defs>
              <path
                fill="url(#google-gold-grad)"
                d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
              />
            </svg>
            <span>{t.googleBtn}</span>
          </button>
        </div>

        {/* Bottom Circular Language Switcher: "ض" for Arabic, "eng" for English */}
        <div className="flex flex-col items-center gap-3 mt-1">
          {onBackToLanding && (
            <button
              type="button"
              className="bg-transparent border-0 text-sage hover:text-[#F0CE63] text-sm font-tajawal cursor-pointer transition"
              onClick={onBackToLanding}
            >
              {t.backToLanding}
            </button>
          )}
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-[#0A201A]/85 border-[1.5px] border-[#D4AF37]/75 text-[#F0CE63] font-cinzel text-[0.95rem] font-bold flex items-center justify-center cursor-pointer transition hover:bg-[#D4AF37]/20 hover:border-[#FFF0B3] hover:scale-105 shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
            onClick={onToggleLang}
            title={lang === 'en' ? 'Switch to Arabic (العربية)' : 'Switch to English'}
          >
            {lang === 'en' ? 'ض' : 'eng'}
          </button>
        </div>
      </main>
    </div>
  );
};
