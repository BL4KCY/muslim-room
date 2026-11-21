'use client';

import React, { useState, useRef } from 'react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { FEATURED_SURAH_TRACKS, INITIAL_MAJLIS_ROOMS } from '../data/mockData';
import { quranKareemCalligraphyUrl } from '../data/assets';

interface LandingPageProps {
  lang: Language;
  onToggleLang: () => void;
  onNavigateAuth: (initialMode: 'login' | 'signup') => void;
}

const FEATURED_QARIS = [
  {
    nameEn: 'Mishary Rashid Alafasy',
    nameAr: 'مشاري راشد العفاسي',
    styleEn: 'Murattal • Kuwait',
    styleAr: 'مرتل • الكويت',
    surahSample: 'Surah Al-Kahf',
  },
  {
    nameEn: 'AbdulBaset AbdulSamad',
    nameAr: 'عبد الباسط عبد الصمد',
    styleEn: 'Mujawwad • Egypt',
    styleAr: 'مجود • مصر',
    surahSample: 'Surah Ar-Rahman',
  },
  {
    nameEn: 'Mahmoud Khalil Al-Husary',
    nameAr: 'محمود خليل الحصري',
    styleEn: 'Murattal • Egypt',
    styleAr: 'مرتل • مصر',
    surahSample: 'Surah Ya-Sin',
  },
  {
    nameEn: 'Nasser Al Qatami',
    nameAr: 'ناصر القطامي',
    styleEn: 'Murattal • Saudi Arabia',
    styleAr: 'مرتل • السعودية',
    surahSample: 'Surah Al-Mulk',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onToggleLang,
  onNavigateAuth,
}) => {
  const t = TRANSLATIONS[lang];
  const [previewTrackIndex, setPreviewTrackIndex] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewVotes, setPreviewVotes] = useState<Record<string, number>>({
    'trk-01-kahf': 42,
    'trk-02-rahman': 31,
    'trk-03-yasin': 27,
  });
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({
    'trk-01-kahf': true,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPreviewTrack = FEATURED_SURAH_TRACKS[previewTrackIndex];

  const handleTogglePreviewAudio = (index?: number) => {
    const targetIdx = typeof index === 'number' ? index : previewTrackIndex;
    if (typeof index === 'number' && index !== previewTrackIndex) {
      setPreviewTrackIndex(index);
      setIsPlayingPreview(true);
      window.setTimeout(() => {
        audioRef.current?.play().catch(() => setIsPlayingPreview(true));
      }, 50);
      return;
    }

    if (!audioRef.current) return;
    if (isPlayingPreview) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => setIsPlayingPreview(!isPlayingPreview));
    }
    setPreviewTrackIndex(targetIdx);
  };

  const handlePreviewVote = (trackId: string) => {
    const already = Boolean(votedIds[trackId]);
    setVotedIds((prev) => ({ ...prev, [trackId]: !already }));
    setPreviewVotes((prev) => ({
      ...prev,
      [trackId]: (prev[trackId] || 20) + (already ? -1 : 1),
    }));
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-[#f8f5ee] font-tajawal bg-[#06110e]"
      dir={t.dir}
    >
      <audio
        ref={audioRef}
        src={currentPreviewTrack.audioPreviewUrl}
        onEnded={() => setIsPlayingPreview(false)}
      />

      {/* Full-Viewport Moroccan Mihrab & Carved Tawriq Borders Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <svg
          className="w-full h-full block"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="landing-tawriq-border"
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
                strokeOpacity="0.42"
                strokeWidth="1.4"
              />
              <path
                d="M38 6
                   C56 16, 62 36, 48 52
                   C58 62, 60 82, 38 104
                   C16 82, 18 62, 28 52
                   C14 36, 20 16, 38 6 Z"
                stroke="#F0CE63"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                fill="#D4AF37"
                fillOpacity="0.08"
              />
              <circle
                cx="38"
                cy="80"
                r="4.5"
                stroke="#F0CE63"
                strokeOpacity="0.55"
                strokeWidth="1.2"
              />
            </pattern>

            <radialGradient id="landing-center-glow" cx="50%" cy="20%" r="62%">
              <stop offset="0%" stopColor="#1B5E4B" stopOpacity="0.62" />
              <stop offset="50%" stopColor="#0B2B22" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#04110D" stopOpacity="1" />
            </radialGradient>

            <linearGradient id="landing-gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE89E" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9A781C" />
            </linearGradient>

            <g id="landing-corner-medallion">
              <path
                d="M 0 -290
                   C 45 -288, 75 -265, 92 -235
                   C 130 -238, 162 -212, 172 -175
                   C 210 -170, 238 -142, 245 -102
                   C 280 -88, 295 -62, 300 0
                   L 0 0 Z"
                fill="#071B15"
                stroke="url(#landing-gold-stroke)"
                strokeWidth="2.2"
              />
              {[18, 42, 68].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 C 22 -80, 32 -165, 0 -235 C -32 -165, -22 -80, 0 0 Z"
                  transform={`rotate(${deg})`}
                  stroke="#F0CE63"
                  strokeOpacity="0.38"
                  strokeWidth="1.2"
                  fill="#D4AF37"
                  fillOpacity="0.06"
                />
              ))}
            </g>
          </defs>

          <rect width="1920" height="1080" fill="#061713" />

          {/* Left & Right Vertical Carved Moroccan Tawriq Borders */}
          <rect x="18" y="0" width="76" height="1080" fill="url(#landing-tawriq-border)" />
          <rect x="1826" y="0" width="76" height="1080" fill="url(#landing-tawriq-border)" />

          {/* Grand Moroccan Poly-Lobed Mihrab Arch */}
          <path
            d="M 270 1080
               L 270 655
               C 230 605, 235 520, 305 480
               L 322 472
               C 275 415, 295 320, 370 285
               L 386 277
               C 352 215, 385 125, 462 98
               L 478 92
               C 458 42, 492 8, 555 0
               L 1365 0
               C 1428 8, 1462 42, 1442 92
               L 1458 98
               C 1535 125, 1568 215, 1534 277
               L 1550 285
               C 1625 320, 1645 415, 1598 472
               L 1615 480
               C 1685 520, 1690 605, 1650 655
               L 1650 1080 Z"
            fill="url(#landing-center-glow)"
            stroke="url(#landing-gold-stroke)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <use href="#landing-corner-medallion" transform="translate(0, 1080)" />
          <use
            href="#landing-corner-medallion"
            transform="translate(1920, 1080) scale(-1, 1)"
          />
        </svg>
      </div>

      {/* Modern Cream/Ivory Topbar */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-md bg-[#FAF7EE]/95 border-b border-[#061713]/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#061713] flex items-center justify-center p-1.5 shadow-sm" aria-hidden="true">
              <img
                src={quranKareemCalligraphyUrl}
                alt=""
                className="w-full h-full object-contain filter invert drop-shadow"
              />
            </div>
            <span className="font-tajawal text-[#061713] font-bold text-lg tracking-tight">
              {t.appName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            <a href="#hero" className="text-[#061713] font-bold text-sm transition hover:text-[#0D382B]">
              {t.navHome}
            </a>
            <a href="#about" className="text-[#061713]/75 font-medium text-sm transition hover:text-[#061713]">
              {t.navAbout}
            </a>
            <a href="#reciters" className="text-[#061713]/75 font-medium text-sm transition hover:text-[#061713]">
              {t.navReciters}
            </a>
            <a href="#features" className="text-[#061713]/75 font-medium text-sm transition hover:text-[#061713]">
              {t.navBlog}
            </a>
            <a href="#live-majlis" className="text-[#061713]/75 font-medium text-sm transition hover:text-[#061713]">
              {t.navContact}
            </a>
          </nav>

          {/* Auth Actions + Circular Language Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-[#061713]/25 text-[#061713] font-bold text-xs flex items-center justify-center hover:bg-[#061713]/5 transition"
              onClick={onToggleLang}
              title={lang === 'en' ? 'Switch to Arabic (العربية)' : 'Switch to English'}
            >
              {lang === 'en' ? 'ض' : 'eng'}
            </button>

            <button
              type="button"
              className="text-[#061713] font-semibold text-sm hover:underline px-2 cursor-pointer transition"
              onClick={() => onNavigateAuth('login')}
            >
              {t.navSignIn}
            </button>

            <button
              type="button"
              className="bg-[#0D382B] hover:bg-[#07241B] text-[#FFF] font-semibold text-sm px-5 py-2 rounded-full transition shadow-sm cursor-pointer"
              onClick={() => onNavigateAuth('signup')}
            >
              {t.navSignUp}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="max-w-4xl mx-auto text-center pt-16 sm:pt-24 pb-14 px-4 flex flex-col items-center">
          <div className="font-amiri text-2xl sm:text-3xl text-[#F0CE63]/90 mb-3 drop-shadow">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F0CE63] mb-5 tracking-wider uppercase">
            ✦ {t.heroBadge}
          </span>

          <h1 className="font-amiri text-4xl sm:text-6xl font-extrabold text-[#f8f5ee] leading-tight max-w-3xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            {t.heroTitle}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#9cb2a9] max-w-2xl leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              className="bg-gradient-to-r from-[#D4AF37] to-[#F0CE63] hover:from-[#E5C158] hover:to-[#FFF0B8] text-[#061713] font-bold px-7 py-3 rounded-full text-base transition shadow-[0_4px_20px_rgba(212,175,55,0.35)] cursor-pointer"
              onClick={() => onNavigateAuth('signup')}
            >
              {t.ctaEnterMajlis}
            </button>

            <a
              href="#live-majlis"
              className="bg-[#0A241C]/85 hover:bg-[#12362A] text-[#f8f5ee] border border-[#D4AF37]/50 font-bold px-7 py-3 rounded-full text-base transition backdrop-blur-sm"
            >
              {t.ctaCreateRoom}
            </a>
          </div>
        </section>

        {/* Live Majlis Showcase Widget */}
        <section id="live-majlis" className="max-w-5xl mx-auto px-4 mb-20">
          <div className="bg-[#081C17]/85 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                <span>{t.livePreviewBadge}</span>
              </div>
              <div className="text-xs text-[#9cb2a9] font-medium">{t.livePreviewHost}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Synchronized Verse & Player */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-[#04110E]/60 border border-white/5 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="block text-sm font-semibold text-[#f8f5ee]">
                      {currentPreviewTrack.surahNumber}. {currentPreviewTrack.surahNameEnglish}{' '}
                      ({currentPreviewTrack.englishMeaning})
                    </span>
                    <span className="block text-xs text-[#9cb2a9] mt-0.5">
                      🎙️ {currentPreviewTrack.qariName} • {currentPreviewTrack.ayahRange}
                    </span>
                  </div>
                  <span className="font-amiri text-2xl text-[#F0CE63]" dir="rtl">
                    {currentPreviewTrack.surahNameArabic}
                  </span>
                </div>

                <div className="my-4 py-4 px-5 bg-[#061713]/80 rounded-lg border border-[#D4AF37]/20">
                  <p className="font-amiri text-2xl sm:text-3xl text-[#F0CE63] leading-relaxed text-right mb-3" dir="rtl">
                    {currentPreviewTrack.sampleArabicVerse}
                  </p>
                  <p className="text-sm text-[#9cb2a9] italic leading-relaxed" dir="ltr">
                    “{currentPreviewTrack.sampleEnglishTranslation}”
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-[#D4AF37] hover:bg-[#F0CE63] text-[#061713] flex items-center justify-center font-bold text-sm transition cursor-pointer"
                    onClick={() => handleTogglePreviewAudio()}
                  >
                    {isPlayingPreview ? '⏸' : '▶'}
                  </button>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2dd4bf] rounded-full w-2/5" />
                  </div>
                  <span className="text-xs text-[#9cb2a9] font-mono">
                    {currentPreviewTrack.durationFormatted}
                  </span>
                </div>
              </div>

              {/* Right: Live Queue */}
              <div className="lg:col-span-5 bg-[#04110E]/60 border border-white/5 rounded-xl p-5 flex flex-col">
                <div className="mb-4">
                  <span className="block font-semibold text-sm text-[#f8f5ee]">{t.surahQueueTitle}</span>
                  <small className="text-xs text-[#9cb2a9]">{t.surahQueueSub}</small>
                </div>

                <div className="flex flex-col gap-2.5">
                  {FEATURED_SURAH_TRACKS.slice(0, 3).map((trk, idx) => {
                    const isCurrent = idx === previewTrackIndex;
                    const votes = previewVotes[trk.id] ?? trk.votesCount;
                    const hasVoted = Boolean(votedIds[trk.id]);
                    return (
                      <div
                        key={trk.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                          isCurrent
                            ? 'bg-[#102A20] border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                            : 'bg-[#061713]/60 border-white/5 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-3 bg-transparent border-0 text-left cursor-pointer flex-1"
                          onClick={() => handleTogglePreviewAudio(idx)}
                        >
                          <span className="text-xs font-bold text-[#D4AF37]">#{idx + 1}</span>
                          <div>
                            <strong className="block text-sm text-[#f8f5ee]">
                              {lang === 'ar' ? trk.surahNameArabic : trk.surahNameEnglish}
                            </strong>
                            <span className="text-xs text-[#9cb2a9]">
                              {trk.qariName} • {trk.ayahRange}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                            hasVoted
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F0CE63]'
                              : 'bg-[#0A241C] border-[#D4AF37]/40 text-[#9cb2a9] hover:text-[#f8f5ee]'
                          }`}
                          onClick={() => handlePreviewVote(trk.id)}
                        >
                          ▲ {votes}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars Section */}
        <section id="features" className="max-w-6xl mx-auto px-4 mb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-[#081C17]/80 backdrop-blur-sm border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 rounded-2xl p-6 transition hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] text-2xl flex items-center justify-center mb-4">
              📖
            </div>
            <h3 className="font-amiri text-xl font-bold text-[#f8f5ee] mb-2">{t.feature1Title}</h3>
            <p className="text-sm text-[#9cb2a9] leading-relaxed">{t.feature1Desc}</p>
          </article>

          <article className="bg-[#081C17]/80 backdrop-blur-sm border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 rounded-2xl p-6 transition hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] text-2xl flex items-center justify-center mb-4">
              ▲
            </div>
            <h3 className="font-amiri text-xl font-bold text-[#f8f5ee] mb-2">{t.feature2Title}</h3>
            <p className="text-sm text-[#9cb2a9] leading-relaxed">{t.feature2Desc}</p>
          </article>

          <article className="bg-[#081C17]/80 backdrop-blur-sm border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 rounded-2xl p-6 transition hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] text-2xl flex items-center justify-center mb-4">
              ۞
            </div>
            <h3 className="font-amiri text-xl font-bold text-[#f8f5ee] mb-2">{t.feature3Title}</h3>
            <p className="text-sm text-[#9cb2a9] leading-relaxed">{t.feature3Desc}</p>
          </article>
        </section>

        {/* Active Majlis Rooms */}
        <section className="max-w-6xl mx-auto px-4 mb-24">
          <div className="text-center mb-10">
            <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-[#f8f5ee]">{t.activeRoomsTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_MAJLIS_ROOMS.map((room) => (
              <div
                key={room.id}
                className="bg-[#081C17]/80 backdrop-blur-sm border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/60 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#2dd4bf] font-semibold">
                      ● {room.listenersCount} {t.listenersLabel}
                    </span>
                    {room.isBeaconNearby && (
                      <span className="text-xs bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] px-2.5 py-0.5 rounded-full">
                        📡 Masjid iBeacon
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#f8f5ee] mb-1.5">{room.name}</h3>
                  <p className="text-xs text-[#9cb2a9] leading-relaxed mb-6">{room.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-[#9cb2a9]">👤 {room.hostName}</span>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#F0CE63] hover:underline cursor-pointer"
                    onClick={() => onNavigateAuth('login')}
                  >
                    {t.joinRoomBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* World-Renowned Reciters */}
        <section id="reciters" className="max-w-6xl mx-auto px-4 pb-28">
          <div className="text-center mb-10">
            <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-[#f8f5ee]">{t.recitersSectionTitle}</h2>
            <p className="text-sm text-[#9cb2a9] mt-2">{t.recitersSectionSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_QARIS.map((qari, idx) => (
              <div
                key={qari.nameEn}
                className="bg-[#081C17]/80 backdrop-blur-sm border border-[#D4AF37]/25 rounded-2xl p-5 text-center flex flex-col items-center hover:border-[#D4AF37]/60 transition shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-2xl flex items-center justify-center mb-3">
                  🎙️
                </div>
                <h3 className="text-base font-bold text-[#f8f5ee]">
                  {lang === 'ar' ? qari.nameAr : qari.nameEn}
                </h3>
                <span className="text-xs text-[#9cb2a9] mt-0.5 mb-4">
                  {lang === 'ar' ? qari.styleAr : qari.styleEn}
                </span>
                <button
                  type="button"
                  className="w-full mt-auto bg-[#0A241C] hover:bg-[#12362A] text-[#F0CE63] border border-[#D4AF37]/40 rounded-full py-2 px-3 text-xs font-bold transition cursor-pointer"
                  onClick={() => handleTogglePreviewAudio(idx % FEATURED_SURAH_TRACKS.length)}
                >
                  ▶ {qari.surahSample}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
