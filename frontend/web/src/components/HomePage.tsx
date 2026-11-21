'use client';

import React, { useState, useRef } from 'react';
import { FEATURED_SURAH_TRACKS, SUGGESTABLE_SURAHS } from '../data/mockData';
import { SurahRecitationTrack, UserProfile } from '../types/quran';
import { clearSecureSession } from '../services/api';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { quranKareemCalligraphyUrl } from '../data/assets';

interface HomePageProps {
  lang: Language;
  onToggleLang: () => void;
  user: UserProfile;
  onLogout: () => void;
}

const ALL_SURAH_TRACKS: SurahRecitationTrack[] = [
  ...FEATURED_SURAH_TRACKS,
  ...SUGGESTABLE_SURAHS,
];

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  onToggleLang,
  user,
  onLogout,
}) => {
  const t = TRANSLATIONS[lang];
  const [tracks, setTracks] = useState<SurahRecitationTrack[]>(ALL_SURAH_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<SurahRecitationTrack>(
    ALL_SURAH_TRACKS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQari, setSelectedQari] = useState<string>('all');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestSurahId, setSuggestSurahId] = useState(ALL_SURAH_TRACKS[0].id);
  const [suggestAyahRange, setSuggestAyahRange] = useState('Ayah 1 – 15');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const uniqueQaris = Array.from(new Set(ALL_SURAH_TRACKS.map((tr) => tr.qariName)));

  const handleAddSuggestedSurah = (e: React.FormEvent) => {
    e.preventDefault();
    const template =
      ALL_SURAH_TRACKS.find((item) => item.id === suggestSurahId) ||
      ALL_SURAH_TRACKS[0];

    setTracks((prev) => {
      const existing = prev.find((item) => item.id === template.id);
      if (existing) {
        const updated = prev.map((item) =>
          item.id === template.id
            ? {
                ...item,
                ayahRange: suggestAyahRange.trim() || item.ayahRange,
                hasVoted: true,
                votesCount: item.hasVoted ? item.votesCount : item.votesCount + 1,
              }
            : item
        );
        return [...updated].sort((a, b) => b.votesCount - a.votesCount);
      }
      const created: SurahRecitationTrack = {
        ...template,
        ayahRange: suggestAyahRange.trim() || template.ayahRange,
        votesCount: 1,
        hasVoted: true,
      };
      return [...prev, created].sort((a, b) => b.votesCount - a.votesCount);
    });
    setSuggestModalOpen(false);
  };

  const handlePlayTrack = (track: SurahRecitationTrack) => {
    setCurrentTrack(track);
    setProgressPercent(0);
    setIsPlaying(true);
    window.setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setIsPlaying(true);
        });
      }
    }, 50);
  };

  const handleStepSurah = (direction: -1 | 1) => {
    const idx = tracks.findIndex((item) => item.id === currentTrack.id);
    if (idx === -1) return;
    const nextIdx = (idx + direction + tracks.length) % tracks.length;
    handlePlayTrack(tracks[nextIdx]);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(!isPlaying));
    }
  };

  const handleVote = (trackId: string) => {
    setTracks((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== trackId) return item;
        const nextVoted = !item.hasVoted;
        return {
          ...item,
          hasVoted: nextVoted,
          votesCount: nextVoted
            ? item.votesCount + 1
            : Math.max(0, item.votesCount - 1),
        };
      });
      return [...updated].sort((a, b) => b.votesCount - a.votesCount);
    });
  };

  const handleLogout = () => {
    clearSecureSession();
    onLogout();
  };

  const filteredTracks = tracks.filter((item) => {
    const matchesQari =
      selectedQari === 'all' || item.qariName === selectedQari;
    const matchesSearch =
      item.surahNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surahNameArabic.includes(searchQuery) ||
      item.qariName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQari && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-32 relative font-tajawal text-[#f8f5ee] bg-[#06110e]" dir={t.dir}>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 backdrop-blur-md bg-[#0A1B16]/95 border-b border-white/10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#061713] flex items-center justify-center p-1.5 border border-[#D4AF37]/40 shadow-sm" aria-hidden="true">
            <img
              src={quranKareemCalligraphyUrl}
              alt=""
              className="w-full h-full object-contain filter invert drop-shadow"
            />
          </div>
          <div>
            <div className="font-bold text-base text-[#F0CE63] tracking-tight">{t.appName}</div>
            <div className="text-xs text-[#9cb2a9] hidden sm:block">{t.appTagline}</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="text-xs text-[#9cb2a9] hidden md:inline">
            {t.greeting} <strong className="text-[#f8f5ee] font-semibold">{user.displayName}</strong>
          </span>

          <button
            type="button"
            className="w-8 h-8 rounded-full border border-[#D4AF37]/50 text-[#F0CE63] font-bold text-xs flex items-center justify-center hover:bg-[#D4AF37]/10 transition cursor-pointer"
            onClick={onToggleLang}
            title={lang === 'en' ? 'Switch to Arabic (العربية)' : 'Switch to English'}
          >
            {lang === 'en' ? 'ض' : 'eng'}
          </button>

          <button
            type="button"
            className="text-xs text-[#9cb2a9] hover:text-red-400 font-semibold px-2.5 py-1 rounded-md border border-white/10 hover:border-red-400/40 transition cursor-pointer"
            onClick={handleLogout}
          >
            {t.signOut}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Featured Now Playing Card */}
        <section className="bg-gradient-to-br from-[#102820] to-[#0A1B16] border border-[#D4AF37]/35 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 border border-teal-500/30 text-[#2dd4bf] uppercase tracking-wider">
                  ● {t.nowPlayingLabel}
                </span>
                <span className="text-xs bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] px-2.5 py-1 rounded-full">
                  {t.liveRoomBadge} • 184 {t.listenersLabel}
                </span>
              </div>
              <h1 className="font-amiri text-2xl sm:text-4xl font-extrabold text-[#f8f5ee] mt-2 mb-1">
                {lang === 'ar'
                  ? currentTrack.surahNameArabic
                  : `${currentTrack.surahNumber}. ${currentTrack.surahNameEnglish} (${currentTrack.englishMeaning})`}
              </h1>
              <p className="text-sm text-[#9cb2a9]">
                🎙️ {t.reciterLabel}: <strong className="text-[#f8f5ee]">{currentTrack.qariName}</strong> •{' '}
                {currentTrack.ayahRange}
              </p>
            </div>

            <div className="font-amiri text-4xl sm:text-5xl text-[#F0CE63] drop-shadow" dir="rtl">
              {currentTrack.surahNameArabic}
            </div>
          </div>

          <div className="bg-[#06110E]/80 border border-[#D4AF37]/20 rounded-xl p-5 sm:p-6 text-center shadow-inner">
            <p className="font-amiri text-2xl sm:text-3xl text-[#F0CE63] leading-relaxed mb-3" dir="rtl">
              {currentTrack.sampleArabicVerse}
            </p>
            <p className="text-sm sm:text-base text-[#9cb2a9] italic leading-relaxed" dir="ltr">
              {currentTrack.sampleEnglishTranslation}
            </p>
          </div>
        </section>

        {/* Surah Queue Header + Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#f8f5ee]">{t.surahQueueTitle}</h2>
            <p className="text-xs text-[#9cb2a9] mt-0.5">{t.surahQueueSub}</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              className="bg-[#102A22]/80 border border-[#D4AF37]/40 rounded-full px-4 py-2 text-xs text-[#f8f5ee] placeholder-[#9cb2a9] focus:outline-none focus:border-[#F0CE63] transition w-44 sm:w-56"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="bg-gradient-to-r from-[#D4AF37] to-[#F0CE63] hover:from-[#E5C158] hover:to-[#FFF0B8] text-[#061713] text-xs font-bold px-4 py-2 rounded-full transition shadow-sm cursor-pointer whitespace-nowrap"
              onClick={() => setSuggestModalOpen(true)}
            >
              {t.suggestSurahBtn}
            </button>
          </div>
        </div>

        {/* Reciter Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
              selectedQari === 'all'
                ? 'bg-[#D4AF37] text-[#061713] border-[#D4AF37]'
                : 'bg-[#0A241C] text-[#9cb2a9] border-white/10 hover:text-[#f8f5ee]'
            }`}
            onClick={() => setSelectedQari('all')}
          >
            {t.allReciters}
          </button>
          {uniqueQaris.map((qari) => (
            <button
              key={qari}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedQari === qari
                  ? 'bg-[#D4AF37] text-[#061713] border-[#D4AF37]'
                  : 'bg-[#0A241C] text-[#9cb2a9] border-white/10 hover:text-[#f8f5ee]'
              }`}
              onClick={() => setSelectedQari(qari)}
            >
              🎙️ {qari}
            </button>
          ))}
        </div>

        {/* Clean Surah List */}
        <div className="flex flex-col gap-3">
          {filteredTracks.map((track, idx) => {
            const isSelected = currentTrack.id === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition ${
                  isSelected
                    ? 'bg-[#102A20] border-[#D4AF37]/70 shadow-[0_0_20px_rgba(212,175,55,0.18)]'
                    : 'bg-[#081C17]/80 border-white/5 hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="text-xs font-bold text-[#D4AF37] w-8">#{idx + 1}</div>

                <div
                  className="flex-1 cursor-pointer pr-3"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <strong className="text-sm sm:text-base text-[#f8f5ee]">
                      {lang === 'ar'
                        ? track.surahNameArabic
                        : `${track.surahNumber}. ${track.surahNameEnglish}`}
                    </strong>
                    {lang === 'en' && (
                      <span className="font-amiri text-sm text-[#F0CE63]" dir="rtl">
                        {track.surahNameArabic}
                      </span>
                    )}
                    <span className="text-[11px] bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F0CE63] px-2 py-0.5 rounded-full">
                      {track.ayahRange}
                    </span>
                  </div>
                  <div className="text-xs text-[#9cb2a9] mt-1 flex items-center gap-2">
                    <span>🎙️ {track.qariName}</span>
                    <span>•</span>
                    <span>⏱ {track.durationFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0A241C] border border-[#D4AF37]/50 text-[#F0CE63] hover:bg-[#12362A] transition cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {isSelected && isPlaying ? `⏸ ${t.playingBtn}` : `▶ ${t.listenBtn}`}
                  </button>

                  <button
                    type="button"
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                      track.hasVoted
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F0CE63]'
                        : 'bg-[#0A241C] border-white/10 text-[#9cb2a9] hover:text-[#f8f5ee]'
                    }`}
                    onClick={() => handleVote(track.id)}
                  >
                    <span>▲ {track.votesCount}</span>
                    <small className="hidden sm:inline">{track.hasVoted ? t.votedBtn : t.voteBtn}</small>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Suggest a Surah Modal */}
      {suggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-[#081C17] border border-[#D4AF37]/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-amiri text-xl font-bold text-[#F0CE63] mb-4">
              {t.suggestModalTitle}
            </h3>
            <form onSubmit={handleAddSuggestedSurah} className="flex flex-col gap-4">
              <div>
                <label htmlFor="suggest-surah-select" className="block text-xs text-[#9cb2a9] mb-1.5 font-medium">
                  {t.surahSelectLabel}
                </label>
                <select
                  id="suggest-surah-select"
                  className="w-full bg-[#102A22] border border-[#D4AF37]/50 rounded-xl px-3 py-2.5 text-sm text-[#f8f5ee] focus:outline-none focus:border-[#F0CE63]"
                  value={suggestSurahId}
                  onChange={(e) => setSuggestSurahId(e.target.value)}
                >
                  {ALL_SURAH_TRACKS.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#081C17] text-[#f8f5ee]">
                      {item.surahNumber}. {item.surahNameEnglish} ({item.surahNameArabic}) — {item.qariName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="suggest-ayah-input" className="block text-xs text-[#9cb2a9] mb-1.5 font-medium">
                  {t.ayahRangeLabel}
                </label>
                <input
                  id="suggest-ayah-input"
                  type="text"
                  className="w-full bg-[#102A22] border border-[#D4AF37]/50 rounded-xl px-3 py-2.5 text-sm text-[#f8f5ee] focus:outline-none focus:border-[#F0CE63]"
                  value={suggestAyahRange}
                  onChange={(e) => setSuggestAyahRange(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-full border border-white/15 text-xs font-semibold text-[#9cb2a9] hover:text-[#f8f5ee] transition cursor-pointer"
                  onClick={() => setSuggestModalOpen(false)}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F0CE63] text-[#061713] text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {t.addSuggestionBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Quran Audio Player */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#081B15]/95 backdrop-blur-md border-t border-[#D4AF37]/30 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" dir="ltr">
        <audio
          ref={audioRef}
          src={currentTrack.audioPreviewUrl}
          onTimeUpdate={() => {
            if (audioRef.current && audioRef.current.duration) {
              setProgressPercent(
                Math.min(
                  100,
                  (audioRef.current.currentTime / audioRef.current.duration) * 100
                )
              );
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center font-amiri text-xl text-[#F0CE63]" dir="rtl">
            {currentTrack.surahNameArabic}
          </div>
          <div>
            <div className="text-sm font-bold text-[#f8f5ee]">
              {currentTrack.surahNameEnglish} • {currentTrack.ayahRange}
            </div>
            <div className="text-xs text-[#9cb2a9]">{currentTrack.qariName}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl justify-end sm:justify-center">
          <button
            type="button"
            className="text-lg text-[#9cb2a9] hover:text-[#f8f5ee] transition cursor-pointer"
            onClick={() => handleStepSurah(-1)}
            title={t.prevSurah}
          >
            ⏮
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-[#D4AF37] hover:bg-[#F0CE63] text-[#061713] font-bold text-sm flex items-center justify-center transition cursor-pointer shadow-md"
            onClick={togglePlayPause}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="text-lg text-[#9cb2a9] hover:text-[#f8f5ee] transition cursor-pointer"
            onClick={() => handleStepSurah(1)}
            title={t.nextSurah}
          >
            ⏭
          </button>

          <div className="hidden md:flex flex-col flex-1 mx-2">
            <div className="text-[11px] text-[#F0CE63] font-amiri text-right truncate mb-1" dir="rtl">
              {currentTrack.sampleArabicVerse}
            </div>
            <div
              className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!audioRef.current || !audioRef.current.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(
                  0,
                  Math.min(1, (e.clientX - rect.left) / rect.width)
                );
                audioRef.current.currentTime = ratio * audioRef.current.duration;
                setProgressPercent(ratio * 100);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#2dd4bf] rounded-full transition-all"
                style={{ width: `${progressPercent || 35}%` }}
              />
            </div>
          </div>

          <span className="text-xs text-[#9cb2a9] font-mono hidden sm:inline">
            {currentTrack.durationFormatted}
          </span>
        </div>
      </footer>
    </div>
  );
};
