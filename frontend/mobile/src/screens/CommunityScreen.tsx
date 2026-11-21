import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { MobileUser } from './AuthScreen';
import { MobileLanguage, MOBILE_TRANSLATIONS } from '../i18n/translations';
import {
  CommunityIcon,
  SearchIcon,
  CloseIcon,
  ChevronRightIcon,
  PlusIcon,
  SignOutIcon,
  CheckSmallIcon,
  LockIcon,
  VoteArrowUpIcon,
  HeadphonesIcon,
} from '../components/HomeIcons';
import {
  ALL_QURAN_SURAHS,
  FAMOUS_RECITERS,
  SurahItem,
  ReciterItem,
} from '../data/quranCatalog';

const MUSLIM_AVATAR = require('../../assets/young.png');

export type VoteLicenseType = 'open' | 'invited_only' | 'place_and_time';
export type VisibilityType = 'public' | 'private';

export interface QueueTrack {
  id: string;
  surahNumber: number;
  surahAr: string;
  surahEn: string;
  qariAr: string;
  qariEn: string;
  ayahRange: string;
  votesCount: number;
  hasVoted: boolean;
  suggestedBy: string;
  suggestedAt: number; // Timestamp for deterministic tie-breaking
  duration: string;
}

export interface StudyRoom {
  id: string;
  titleAr: string;
  titleEn: string;
  hostAr: string;
  hostEn: string;
  surahAr: string;
  surahEn: string;
  category: 'all' | 'tadabbur' | 'tajweed' | 'hifz' | 'adhkar';
  visibility: VisibilityType;
  voteLicense: VoteLicenseType;
  locationLabel?: string;
  timeWindowLabel?: string;
  listeners: number;
  isFeatured?: boolean;
  inviteCode?: string;
  currentPlayingTrack: {
    surahAr: string;
    surahEn: string;
    qariAr: string;
    qariEn: string;
    ayahRange: string;
    duration: string;
  };
  queue: QueueTrack[];
}

const INITIAL_QUEUE_ROOM_1: QueueTrack[] = [
  {
    id: 'trk-1',
    surahNumber: 55,
    surahAr: 'سورة الرحمن',
    surahEn: 'Surah Ar-Rahman',
    qariAr: 'عبد الباسط عبد الصمد',
    qariEn: 'AbdulBaset AbdulSamad',
    ayahRange: 'آية ١ – ٢٥',
    votesCount: 54,
    hasVoted: true,
    suggestedBy: 'عمر الفاروق',
    suggestedAt: 1000,
    duration: '06:45',
  },
  {
    id: 'trk-2',
    surahNumber: 36,
    surahAr: 'سورة يسٓ',
    surahEn: 'Surah Ya-Sin',
    qariAr: 'محمود خليل الحصري',
    qariEn: 'Mahmoud Khalil Al-Husary',
    ayahRange: 'آية ١ – ١٩',
    votesCount: 42,
    hasVoted: false,
    suggestedBy: 'فاطمة الزهراء',
    suggestedAt: 2000,
    duration: '05:12',
  },
  {
    id: 'trk-3',
    surahNumber: 67,
    surahAr: 'سورة الملك',
    surahEn: 'Surah Al-Mulk',
    qariAr: 'ناصر القطامي',
    qariEn: 'Nasser Al-Qatami',
    ayahRange: 'كاملة (١ – ٣٠)',
    votesCount: 19,
    hasVoted: false,
    suggestedBy: 'بلال خالد',
    suggestedAt: 3000,
    duration: '07:20',
  },
  {
    id: 'trk-4',
    surahNumber: 56,
    surahAr: 'سورة الواقعة',
    surahEn: 'Surah Al-Waqi’ah',
    qariAr: 'سعد الغامدي',
    qariEn: 'Saad Al-Ghamdi',
    ayahRange: 'آية ١ – ٤٠',
    votesCount: 19,
    hasVoted: false,
    suggestedBy: 'يوسف منصور',
    suggestedAt: 4000,
    duration: '08:15',
  },
];

const INITIAL_ROOMS: StudyRoom[] = [
  {
    id: 'room-1',
    titleAr: 'حلقة نور الجمعة المباركة',
    titleEn: 'Jumu’ah Nur Circle',
    hostAr: 'الشيخ طارق إبراهيم',
    hostEn: 'Sheikh Tariq Ibrahim',
    surahAr: 'سورة الكهف • تدبر وتلاوة',
    surahEn: 'Surah Al-Kahf • Reflection',
    category: 'tadabbur',
    visibility: 'public', // PUBLIC by default
    voteLicense: 'open', // OPEN license by default: everyone can vote
    listeners: 184,
    isFeatured: true,
    currentPlayingTrack: {
      surahAr: 'سورة الكهف',
      surahEn: 'Surah Al-Kahf',
      qariAr: 'مشاري راشد العفاسي',
      qariEn: 'Mishary Rashid Alafasy',
      ayahRange: 'آية ١ – ١٠',
      duration: '04:18',
    },
    queue: INITIAL_QUEUE_ROOM_1,
  },
  {
    id: 'room-2',
    titleAr: 'مجلس تدبر مسجد النور',
    titleEn: 'Masjid Al-Noor Tadabbur',
    hostAr: 'الإمام زيد الأنصاري',
    hostEn: 'Imam Zaid Al-Ansari',
    surahAr: 'سورة الرحمن • فبأي آلاء ربكما',
    surahEn: 'Surah Ar-Rahman',
    category: 'tadabbur',
    visibility: 'public', // Public event
    voteLicense: 'place_and_time', // PLACE & TIME license: 4:00 PM - 6:00 PM in Masjid
    locationLabel: 'حرم مسجد النور (نطاق ٢٥٠م)',
    timeWindowLabel: '١٦:٠٠ – ١٨:٠٠ (٤:٠٠ – ٦:٠٠ م)',
    listeners: 62,
    currentPlayingTrack: {
      surahAr: 'سورة يسٓ',
      surahEn: 'Surah Ya-Sin',
      qariAr: 'عبد الباسط عبد الصمد',
      qariEn: 'AbdulBaset AbdulSamad',
      ayahRange: 'آية ١ – ١٢',
      duration: '05:30',
    },
    queue: [INITIAL_QUEUE_ROOM_1[0], INITIAL_QUEUE_ROOM_1[2]],
  },
  {
    id: 'room-3',
    titleAr: 'مقرأة الإتقان وتصحيح التلاوة',
    titleEn: 'Tajweed Mastery & Correction',
    hostAr: 'المقرئ بلال الدوسري',
    hostEn: 'Qari Bilal Al-Dawsari',
    surahAr: 'سورة البقرة (١-٥٠) • مخارج الحروف',
    surahEn: 'Surah Al-Baqarah (1–50)',
    category: 'tajweed',
    visibility: 'public',
    voteLicense: 'open',
    listeners: 95,
    currentPlayingTrack: {
      surahAr: 'سورة البقرة',
      surahEn: 'Surah Al-Baqarah',
      qariAr: 'بلال الدوسري',
      qariEn: 'Bilal Al-Dawsari',
      ayahRange: 'آية ١ – ٥',
      duration: '03:45',
    },
    queue: [INITIAL_QUEUE_ROOM_1[1], INITIAL_QUEUE_ROOM_1[3]],
  },
  {
    id: 'room-4',
    titleAr: 'حلقة الفجر للحفظ والمراجعة (خاصة بالدعوة)',
    titleEn: 'Private Hifz Revision Circle',
    hostAr: 'الحافظ يوسف منصور',
    hostEn: 'Hafiz Yusuf Mansour',
    surahAr: 'جزء عم وجزء تبارك',
    surahEn: 'Juz’ Amma & Tabarak',
    category: 'hifz',
    visibility: 'private', // PRIVATE EVENT: only invited users can find and vote
    voteLicense: 'invited_only', // INVITED ONLY license
    inviteCode: 'HIFZ777',
    listeners: 19,
    currentPlayingTrack: {
      surahAr: 'سورة النبأ',
      surahEn: 'Surah An-Naba',
      qariAr: 'يوسف منصور',
      qariEn: 'Yusuf Mansour',
      ayahRange: 'آية ١ – ٤٠',
      duration: '04:10',
    },
    queue: [INITIAL_QUEUE_ROOM_1[2], INITIAL_QUEUE_ROOM_1[0]],
  },
  {
    id: 'room-5',
    titleAr: 'مجلس السكينة والورد المسائي',
    titleEn: 'Evening Sanctuary & Adhkar',
    hostAr: 'القارئ أنس الكندري',
    hostEn: 'Qari Anas Al-Kandari',
    surahAr: 'أواخر سورة الحشر وأذكار المساء',
    surahEn: 'Surah Al-Hashr & Adhkar',
    category: 'adhkar',
    visibility: 'public',
    voteLicense: 'open',
    listeners: 41,
    currentPlayingTrack: {
      surahAr: 'سورة الحشر',
      surahEn: 'Surah Al-Hashr',
      qariAr: 'أنس الكندري',
      qariEn: 'Anas Al-Kandari',
      ayahRange: 'آية ١٨ – ٢٤',
      duration: '04:50',
    },
    queue: [INITIAL_QUEUE_ROOM_1[1]],
  },
];

interface CommunityScreenProps {
  lang: MobileLanguage;
  onToggleLang: () => void;
  user: MobileUser;
  onBackToHome: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  lang,
  onToggleLang,
  user,
  onBackToHome,
}) => {
  const t = MOBILE_TRANSLATIONS[lang];
  const isRtl = t.isRtl;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'tadabbur' | 'tajweed' | 'hifz' | 'adhkar'
  >('all');
  const [activeJoinedRoom, setActiveJoinedRoom] = useState<StudyRoom | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [enteredInviteCode, setEnteredInviteCode] = useState('');

  // Suggest Track Form State (Lists of 114 Surahs & Famous Reciters)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(18); // Default: Al-Kahf
  const [selectedReciterId, setSelectedReciterId] = useState<string>('mishary'); // Default: Mishary Alafasy
  const [suggestAyah, setSuggestAyah] = useState('آية ١ – ١٠');
  const [suggestTab, setSuggestTab] = useState<'surah' | 'reciter'>('surah');
  const [surahSearchText, setSurahSearchText] = useState('');
  const [reciterSearchText, setReciterSearchText] = useState('');

  // New room form state (Lists of 114 Surahs & Famous Reciters for Community Creation)
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomSurahNumber, setNewRoomSurahNumber] = useState<number>(18); // Default: Al-Kahf
  const [newRoomReciterId, setNewRoomReciterId] = useState<string>('mishary'); // Default: Mishary Alafasy
  const [newRoomCategory, setNewRoomCategory] = useState<
    'tadabbur' | 'tajweed' | 'hifz' | 'adhkar'
  >('tadabbur');
  const [newRoomVisibility, setNewRoomVisibility] =
    useState<VisibilityType>('public');
  const [newRoomLicense, setNewRoomLicense] =
    useState<VoteLicenseType>('open');
  const [createTab, setCreateTab] = useState<'surah' | 'reciter'>('surah');
  const [createSurahSearch, setCreateSurahSearch] = useState('');
  const [createReciterSearch, setCreateReciterSearch] = useState('');

  const [roomsList, setRoomsList] = useState<StudyRoom[]>(INITIAL_ROOMS);

  // Filtered 114 Surahs for instant search (Suggest Modal):
  const filteredSurahs = ALL_QURAN_SURAHS.filter((surah) => {
    if (!surahSearchText.trim()) return true;
    const query = surahSearchText.trim().toLowerCase();
    return (
      surah.number.toString() === query ||
      surah.nameAr.includes(query) ||
      surah.nameEn.toLowerCase().includes(query)
    );
  });

  // Filtered Reciters for instant search (Suggest Modal):
  const filteredReciters = FAMOUS_RECITERS.filter((reciter) => {
    if (!reciterSearchText.trim()) return true;
    const query = reciterSearchText.trim().toLowerCase();
    return (
      reciter.nameAr.includes(query) ||
      reciter.nameEn.toLowerCase().includes(query) ||
      reciter.styleAr.includes(query) ||
      reciter.styleEn.toLowerCase().includes(query)
    );
  });

  // Filtered lists for Create Community Modal:
  const createFilteredSurahs = ALL_QURAN_SURAHS.filter((surah) => {
    if (!createSurahSearch.trim()) return true;
    const query = createSurahSearch.trim().toLowerCase();
    return (
      surah.number.toString() === query ||
      surah.nameAr.includes(query) ||
      surah.nameEn.toLowerCase().includes(query)
    );
  });

  const createFilteredReciters = FAMOUS_RECITERS.filter((reciter) => {
    if (!createReciterSearch.trim()) return true;
    const query = createReciterSearch.trim().toLowerCase();
    return (
      reciter.nameAr.includes(query) ||
      reciter.nameEn.toLowerCase().includes(query) ||
      reciter.styleAr.includes(query) ||
      reciter.styleEn.toLowerCase().includes(query)
    );
  });

  const selectedSurahObj =
    ALL_QURAN_SURAHS.find((s) => s.number === selectedSurahNumber) ||
    ALL_QURAN_SURAHS[17];
  const selectedReciterObj =
    FAMOUS_RECITERS.find((r) => r.id === selectedReciterId) ||
    FAMOUS_RECITERS[0];

  const newRoomSurahObj =
    ALL_QURAN_SURAHS.find((s) => s.number === newRoomSurahNumber) ||
    ALL_QURAN_SURAHS[17];
  const newRoomReciterObj =
    FAMOUS_RECITERS.find((r) => r.id === newRoomReciterId) ||
    FAMOUS_RECITERS[0];

  // Deterministic sorting to handle competition problematics:
  // Sorts primarily by highest votes; if votes are tied, earlier suggestion timestamp breaks the tie.
  const sortQueueDeterministically = (queue: QueueTrack[]): QueueTrack[] => {
    return [...queue].sort((a, b) => {
      if (b.votesCount !== a.votesCount) {
        return b.votesCount - a.votesCount;
      }
      return a.suggestedAt - b.suggestedAt;
    });
  };

  // License check evaluator - In any joined room (public or private), anyone can vote & suggest
  const checkVoteLicenseEligibility = (
    room: StudyRoom
  ): { eligible: boolean; reason: string } => {
    return {
      eligible: true,
      reason:
        lang === 'ar'
          ? 'التصويت متاح لجميع المشاركين في المجلس'
          : 'Voting is open to all members in this circle',
    };
  };

  // Handle voting on a track in the live chain:
  // Anyone in the community (private or public) can vote!
  const handleVoteTrack = (trackId: string) => {
    if (!activeJoinedRoom) return;

    const updatedQueue = activeJoinedRoom.queue.map((track) => {
      if (track.id !== trackId) return track;
      const nextVoted = !track.hasVoted;
      return {
        ...track,
        hasVoted: nextVoted,
        votesCount: nextVoted
          ? track.votesCount + 1
          : Math.max(0, track.votesCount - 1),
      };
    });

    const sorted = sortQueueDeterministically(updatedQueue);

    const updatedRoom: StudyRoom = {
      ...activeJoinedRoom,
      queue: sorted,
    };

    setActiveJoinedRoom(updatedRoom);
    setRoomsList((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
    );
  };

  // Handle suggesting a new track to the live chain:
  // Anyone in the community (private or public) can suggest from lists of 114 Surahs and Qaris!
  const handleAddSuggestedTrack = () => {
    if (!activeJoinedRoom) return;

    const newTrack: QueueTrack = {
      id: `trk-${Date.now()}`,
      surahNumber: selectedSurahObj.number,
      surahAr: `سورة ${selectedSurahObj.nameAr}`,
      surahEn: `Surah ${selectedSurahObj.nameEn}`,
      qariAr: selectedReciterObj.nameAr,
      qariEn: selectedReciterObj.nameEn,
      ayahRange: suggestAyah || (lang === 'ar' ? 'كامل السورة' : 'Full Surah'),
      votesCount: 1, // starts with initial vote from the suggester
      hasVoted: true,
      suggestedBy: user.displayName || (lang === 'ar' ? 'أنت' : 'You'),
      suggestedAt: Date.now(),
      duration: '05:30',
    };

    const newQueue = sortQueueDeterministically([
      ...activeJoinedRoom.queue,
      newTrack,
    ]);

    const updatedRoom: StudyRoom = {
      ...activeJoinedRoom,
      queue: newQueue,
    };

    setActiveJoinedRoom(updatedRoom);
    setRoomsList((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
    );
    setIsSuggestModalOpen(false);
  };

  // Filtered rooms considering Visibility (Public vs Private):
  const filteredRooms = roomsList.filter((room) => {
    if (room.visibility === 'private') {
      const isCodeUnlocked =
        enteredInviteCode &&
        room.inviteCode?.toLowerCase() ===
          enteredInviteCode.trim().toLowerCase();
      // Show private rooms if unlocked via code or by default list exploration
      if (enteredInviteCode.trim() !== '' && !isCodeUnlocked) return false;
    }

    const matchesCategory =
      selectedCategory === 'all' || room.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      room.titleAr.includes(searchQuery) ||
      room.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostAr.includes(searchQuery) ||
      room.hostEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.surahAr.includes(searchQuery) ||
      room.surahEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredRoom = roomsList.find((r) => r.isFeatured) || roomsList[0];

  const handleCreateRoom = () => {
    const finalTitle =
      newRoomTitle.trim() ||
      (lang === 'ar'
        ? `حلقة تدارس سورة ${newRoomSurahObj.nameAr}`
        : `Surah ${newRoomSurahObj.nameEn} Study Circle`);

    const created: StudyRoom = {
      id: `room-${Date.now()}`,
      titleAr: finalTitle,
      titleEn: finalTitle,
      hostAr: user.displayName || (lang === 'ar' ? 'زياد القارئ' : 'Ziad Al-Qari'),
      hostEn: user.displayName || 'Ziad Al-Qari',
      surahAr: `سورة ${newRoomSurahObj.nameAr}`,
      surahEn: `Surah ${newRoomSurahObj.nameEn}`,
      category: newRoomCategory,
      visibility: newRoomVisibility,
      voteLicense: newRoomLicense,
      locationLabel:
        newRoomLicense === 'place_and_time'
          ? 'مسجد النور (نطاق ٢٥٠م)'
          : undefined,
      timeWindowLabel:
        newRoomLicense === 'place_and_time'
          ? '١٦:٠٠ – ١٨:٠٠ (٤-٦ م)'
          : undefined,
      listeners: 1,
      currentPlayingTrack: {
        surahAr: `سورة ${newRoomSurahObj.nameAr}`,
        surahEn: `Surah ${newRoomSurahObj.nameEn}`,
        qariAr: newRoomReciterObj.nameAr,
        qariEn: newRoomReciterObj.nameEn,
        ayahRange: lang === 'ar' ? 'آية ١ – ١٠' : 'Ayah 1–10',
        duration: '04:30',
      },
      queue: [
        {
          id: `trk-${Date.now()}-1`,
          surahNumber: newRoomSurahObj.number,
          surahAr: `سورة ${newRoomSurahObj.nameAr}`,
          surahEn: `Surah ${newRoomSurahObj.nameEn}`,
          qariAr: newRoomReciterObj.nameAr,
          qariEn: newRoomReciterObj.nameEn,
          ayahRange: lang === 'ar' ? 'آية ١ – ١٠' : 'Ayah 1–10',
          votesCount: 1,
          hasVoted: true,
          suggestedBy: user.displayName || (lang === 'ar' ? 'أنت' : 'You'),
          suggestedAt: Date.now(),
          duration: '04:30',
        },
      ],
    };
    setRoomsList([created, ...roomsList]);
    setIsCreateModalOpen(false);
    setNewRoomTitle('');
    setActiveJoinedRoom(created);
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={[styles.topHeaderRow, isRtl && styles.rtlRow]}>
          <View
            style={[
              styles.headerTitles,
              isRtl ? styles.alignRtl : styles.alignLtr,
            ]}
          >
            <Text
              style={[
                styles.screenTitle,
                { fontFamily: FONTS.tajawal },
              ]}
            >
              {t.communityTitle}
            </Text>
          </View>

          {/* Create Circle Button */}
          <TouchableOpacity
            style={[styles.createCircleBtn, isRtl && styles.rtlRow]}
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#0A221C" />
            <Text style={styles.createCircleBtnText}>{t.createCircleBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Status Banner */}
        <View style={styles.statusBannersBox}>
          <View style={[styles.liveStatusBanner, isRtl && styles.rtlRow]}>
            <View style={styles.pulsingGreenDot} />
            <Text style={styles.liveStatusText}>{t.activeNowBanner}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBarWrapper, isRtl && styles.searchBarRtl]}>
          <TextInput
            style={[
              styles.searchInput,
              isRtl && styles.rtlInput,
              { fontFamily: FONTS.tajawal },
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchCommunityPlaceholder}
            placeholderTextColor="#6B8E7C"
            returnKeyType="search"
          />
          <View style={styles.searchIconBox}>
            <SearchIcon size={20} color="#6B8E7C" />
          </View>
        </View>

        {/* Category Tabs (Horizontal Scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoryScroll,
            isRtl && styles.rtlCategoryScroll,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'all' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'all' && styles.categoryPillTextActive,
              ]}
            >
              {t.categoryAll}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'tadabbur' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('tadabbur')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'tadabbur' && styles.categoryPillTextActive,
              ]}
            >
              {t.categoryTadabbur}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'tajweed' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('tajweed')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'tajweed' && styles.categoryPillTextActive,
              ]}
            >
              {t.categoryTajweed}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'hifz' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('hifz')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'hifz' && styles.categoryPillTextActive,
              ]}
            >
              {t.categoryHifz}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'adhkar' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('adhkar')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'adhkar' && styles.categoryPillTextActive,
              ]}
            >
              {t.categoryAdhkar}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Featured Live Circle Banner */}
        {selectedCategory === 'all' && searchQuery.trim() === '' && (
          <View style={styles.featuredContainer}>
            <View style={[styles.featuredCard, isRtl && styles.alignRtl]}>
              <View style={[styles.featuredBadgeRow, isRtl && styles.rtlRow]}>
                <View style={styles.livePulseTag}>
                  <View style={styles.pulsingRedDot} />
                  <Text style={styles.livePulseTagText}>{t.liveBadge}</Text>
                </View>

                {/* Visibility & License Badges */}
                <View style={[styles.badgeGroup, isRtl && styles.rtlRow]}>
                  <View style={styles.visibilityBadge}>
                    <Text style={styles.visibilityBadgeText}>
                      {featuredRoom.visibility === 'public'
                        ? t.visibilityPublic
                        : t.visibilityPrivate}
                    </Text>
                  </View>

                  <View style={styles.featuredListenersTag}>
                    <Text style={styles.featuredListenersText}>
                      {featuredRoom.listeners} {t.listenersCount}
                    </Text>
                  </View>
                </View>
              </View>

              <Text
                style={[
                  styles.featuredTitle,
                  { fontFamily: FONTS.tajawal },
                ]}
              >
                {lang === 'ar' ? featuredRoom.titleAr : featuredRoom.titleEn}
              </Text>

              <Text style={styles.featuredHost}>
                {lang === 'ar' ? featuredRoom.hostAr : featuredRoom.hostEn}
              </Text>

              <Text style={styles.featuredSurah}>
                {lang === 'ar' ? featuredRoom.surahAr : featuredRoom.surahEn}
              </Text>

              {/* Vote Chain Preview Info */}
              <View style={[styles.featuredQueueBanner, isRtl && styles.rtlRow]}>
                <VoteArrowUpIcon size={14} color="#D4AF37" />
                <Text style={styles.featuredQueueBannerText}>
                  {lang === 'ar'
                    ? `سلسلة تصويت مباشرة • التالي: ${featuredRoom.queue[0]?.surahAr || 'سورة الرحمن'} (${featuredRoom.queue[0]?.votesCount} صوت)`
                    : `Live vote queue • Next: ${featuredRoom.queue[0]?.surahEn} (${featuredRoom.queue[0]?.votesCount} votes)`}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.joinFeaturedBtn, isRtl && styles.rtlRow]}
                onPress={() => setActiveJoinedRoom(featuredRoom)}
                activeOpacity={0.85}
              >
                <CommunityIcon size={20} color="#0A221C" />
                <Text style={styles.joinFeaturedBtnText}>{t.joinRoom}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List of Active Circles */}
        <View style={styles.circlesListSection}>
          <View style={[styles.circlesListHeader, isRtl && styles.rtlRow]}>
            <Text
              style={[
                styles.sectionTitle,
                { fontFamily: FONTS.tajawal },
                isRtl ? styles.alignRtlText : styles.alignLtrText,
              ]}
            >
              {t.communityCardTitle}
            </Text>

            {/* Private invite code unlock link */}
            <TouchableOpacity
              onPress={() => setIsInviteModalOpen(true)}
              style={styles.unlockPrivateBtn}
            >
              <LockIcon size={14} color="#D4AF37" />
              <Text style={styles.unlockPrivateBtnText}>
                {lang === 'ar' ? 'رمز دعوة خاصة' : 'Invite Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.circlesStack}>
            {filteredRooms.map((room) => {
              const isJoined = activeJoinedRoom?.id === room.id;
              const licenseStatus = checkVoteLicenseEligibility(room);

              return (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomCard,
                    isRtl && styles.rtlRow,
                    isJoined && styles.roomCardJoined,
                  ]}
                  onPress={() => setActiveJoinedRoom(room)}
                  activeOpacity={0.85}
                >
                  {/* Icon Box */}
                  <View style={styles.roomIconBox}>
                    <CommunityIcon
                      size={22}
                      color={isJoined ? '#D4AF37' : '#6B8E7C'}
                    />
                  </View>

                  {/* Details Column */}
                  <View
                    style={[
                      styles.roomDetailsCol,
                      isRtl ? styles.alignRtl : styles.alignLtr,
                    ]}
                  >
                    {/* Badges line: Visibility & License */}
                    <View style={[styles.roomBadgesRow, isRtl && styles.rtlRow]}>
                      <View
                        style={[
                          styles.visibilityPillSmall,
                          room.visibility === 'private' &&
                            styles.visibilityPillPrivate,
                        ]}
                      >
                        <Text style={styles.visibilityPillSmallText}>
                          {room.visibility === 'public' ? 'عام' : 'خاص'}
                        </Text>
                      </View>

                      {room.voteLicense === 'place_and_time' && (
                        <View style={styles.licensePillPlace}>
                          <Text style={styles.licensePillPlaceText}>
                            {room.timeWindowLabel || '٤-٦ م'}
                          </Text>
                        </View>
                      )}

                      {room.voteLicense === 'invited_only' && (
                        <View style={styles.licensePillInvited}>
                          <Text style={styles.licensePillInvitedText}>
                            دعوة
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.roomTitle,
                        { fontFamily: FONTS.tajawal },
                      ]}
                      numberOfLines={1}
                    >
                      {lang === 'ar' ? room.titleAr : room.titleEn}
                    </Text>

                    <Text style={styles.roomHost} numberOfLines={1}>
                      {lang === 'ar' ? room.hostAr : room.hostEn}
                    </Text>

                    {/* Next track in queue preview */}
                    <Text style={styles.roomNextInQueue} numberOfLines={1}>
                      {t.nextToPlayTag}:{' '}
                      {lang === 'ar'
                        ? room.queue[0]?.surahAr || room.surahAr
                        : room.queue[0]?.surahEn || room.surahEn}{' '}
                      ({room.queue[0]?.votesCount || 0} {t.voteBtn})
                    </Text>
                  </View>

                  {/* Right/Left Listeners Count & Join Button */}
                  <View style={styles.roomActionCol}>
                    <View style={styles.liveListenersBadge}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.liveListenersCount}>
                        {room.listeners}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.roomJoinMiniBtn,
                        isJoined && styles.roomJoinMiniBtnActive,
                      ]}
                      onPress={() => setActiveJoinedRoom(room)}
                    >
                      <Text
                        style={[
                          styles.roomJoinMiniBtnText,
                          isJoined && styles.roomJoinMiniBtnTextActive,
                        ]}
                      >
                        {isJoined ? t.listeningNow : t.joinRoom}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* ====== ACTIVE LIVE ROOM MODAL (Music Track Vote & Chain) ====== */}
      {/* ======================================================== */}
      <Modal
        visible={activeJoinedRoom !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveJoinedRoom(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setActiveJoinedRoom(null)}
          />

          <View style={styles.activeRoomSheet}>
            <View style={styles.sheetHandleBar} />

            {/* Room Header with Visibility Status */}
            <View style={[styles.activeRoomHeaderRow, isRtl && styles.rtlRow]}>
              <View
                style={[
                  styles.activeRoomTitleBox,
                  isRtl && styles.alignRtl,
                ]}
              >
                {/* Badges line: Live + Visibility + Open Voting Status */}
                <View style={[styles.activeBadgesRow, isRtl && styles.rtlRow]}>
                  <View style={styles.activeLivePill}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.activeLivePillText}>{t.liveBadge}</Text>
                  </View>

                  <View
                    style={[
                      styles.visibilityPillSmall,
                      activeJoinedRoom?.visibility === 'private' &&
                        styles.visibilityPillPrivate,
                    ]}
                  >
                    <Text style={styles.visibilityPillSmallText}>
                      {activeJoinedRoom?.visibility === 'public'
                        ? t.visibilityPublic
                        : t.visibilityPrivate}
                    </Text>
                  </View>

                  <View style={styles.openVotePill}>
                    <Text style={styles.openVotePillText}>
                      {lang === 'ar' ? 'التصويت متاح للجميع' : 'Vote & Suggest Open'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.activeRoomTitle,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  numberOfLines={1}
                >
                  {lang === 'ar'
                    ? activeJoinedRoom?.titleAr
                    : activeJoinedRoom?.titleEn}
                </Text>
                <Text style={styles.activeRoomHost}>
                  {lang === 'ar'
                    ? activeJoinedRoom?.hostAr
                    : activeJoinedRoom?.hostEn}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setActiveJoinedRoom(null)}
                activeOpacity={0.7}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            {/* Smooth full-sheet ScrollView: slide smoothly from ANY spot! */}
            <ScrollView
              style={styles.sheetScrollView}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* Currently Playing Track Box */}
              <View style={styles.currentlyPlayingBox}>
                <View
                  style={[
                    styles.playingHeaderRow,
                    isRtl && styles.rtlRow,
                  ]}
                >
                  <Text style={styles.playingTag}>{t.nowPlayingLabel}</Text>
                  <Text style={styles.playingDuration}>
                    {activeJoinedRoom?.currentPlayingTrack.duration}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.playingSurah,
                    { fontFamily: lang === 'ar' ? FONTS.amiri : FONTS.tajawal },
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? activeJoinedRoom?.currentPlayingTrack.surahAr
                    : activeJoinedRoom?.currentPlayingTrack.surahEn}{' '}
                  ({activeJoinedRoom?.currentPlayingTrack.ayahRange})
                </Text>

                <Text
                  style={[
                    styles.playingQari,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? activeJoinedRoom?.currentPlayingTrack.qariAr
                    : activeJoinedRoom?.currentPlayingTrack.qariEn}
                </Text>

                {/* Simulated Live Audio Waveform */}
                <View style={styles.waveformContainer}>
                  <View style={styles.waveBar1} />
                  <View style={styles.waveBar2} />
                  <View style={styles.waveBar3} />
                  <View style={styles.waveBar4} />
                  <View style={styles.waveBar5} />
                  <View style={styles.waveBar6} />
                  <View style={styles.waveBar7} />
                  <View style={styles.waveBar8} />
                  <View style={styles.waveBar9} />
                </View>
              </View>

              {/* ========================================================= */}
              {/* ====== LIVE RECITATION CHAIN WITH VOTE (THE QUEUE) ====== */}
              {/* ========================================================= */}
              <View style={styles.queueSectionBox}>
                <View style={[styles.queueHeaderRow, isRtl && styles.rtlRow]}>
                  <View style={styles.queueTitles}>
                    <Text style={styles.queueMainTitle}>{t.liveQueueTitle}</Text>
                    <Text style={styles.queueSubTitle}>
                      {t.liveQueueSubtitle}
                    </Text>
                  </View>

                  {/* Suggest a Track Button - Open to everyone in the room */}
                  <TouchableOpacity
                    style={[styles.suggestTrackBtn, isRtl && styles.rtlRow]}
                    onPress={() => setIsSuggestModalOpen(true)}
                    activeOpacity={0.8}
                  >
                    <PlusIcon size={14} color="#0A221C" />
                    <Text style={styles.suggestTrackBtnText}>
                      {t.suggestTrackBtn}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Competition Tie Note */}
                <Text style={styles.competitionTieNoteText}>
                  {t.competitionTieNote}
                </Text>

                {/* All tracks in queue rendered directly (smooth sliding, no nested trap!) */}
                {activeJoinedRoom?.queue.map((track, index) => {
                  const isTopRanked = index === 0;

                  return (
                    <View
                      key={track.id}
                      style={[
                        styles.queueTrackCard,
                        isRtl && styles.rtlRow,
                        isTopRanked && styles.queueTrackCardTop,
                      ]}
                    >
                      {/* Rank Indicator (#1, #2, #3) */}
                      <View
                        style={[
                          styles.rankBox,
                          isTopRanked && styles.rankBoxTop,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankNumber,
                            isTopRanked && styles.rankNumberTop,
                          ]}
                        >
                          #{index + 1}
                        </Text>
                      </View>

                      {/* Track Info */}
                      <View
                        style={[
                          styles.queueTrackInfo,
                          isRtl ? styles.alignRtl : styles.alignLtr,
                        ]}
                      >
                        {isTopRanked && (
                          <View style={styles.nextToPlayPill}>
                            <Text style={styles.nextToPlayPillText}>
                              {t.nextToPlayTag}
                            </Text>
                          </View>
                        )}

                        <Text
                          style={[
                            styles.queueSurahTitle,
                            {
                              fontFamily:
                                lang === 'ar' ? FONTS.amiri : FONTS.tajawal,
                            },
                          ]}
                        >
                          {lang === 'ar' ? track.surahAr : track.surahEn}{' '}
                          <Text style={styles.queueAyahRange}>
                            ({track.ayahRange})
                          </Text>
                        </Text>

                        <Text style={styles.queueQariName}>
                          {lang === 'ar' ? track.qariAr : track.qariEn} •{' '}
                          {track.duration}
                        </Text>

                        <Text style={styles.suggestedByText}>
                          {lang === 'ar' ? 'اقتراح:' : 'Suggested by:'}{' '}
                          {track.suggestedBy}
                        </Text>
                      </View>

                      {/* Vote Button - Anyone in community can vote and upvote! */}
                      <TouchableOpacity
                        style={[
                          styles.voteActionBtn,
                          track.hasVoted && styles.voteActionBtnActive,
                        ]}
                        onPress={() => handleVoteTrack(track.id)}
                        activeOpacity={0.75}
                      >
                        <VoteArrowUpIcon
                          size={15}
                          color={track.hasVoted ? '#0A221C' : '#D4AF37'}
                        />

                        <Text
                          style={[
                            styles.voteActionBtnText,
                            track.hasVoted && styles.voteActionBtnTextActive,
                          ]}
                        >
                          {track.votesCount}
                        </Text>

                        <Text
                          style={[
                            styles.voteBtnSmallLabel,
                            track.hasVoted && styles.voteActionBtnTextActive,
                          ]}
                        >
                          {track.hasVoted ? t.votedBtn : t.voteBtn}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Clean Leave Room Button (No Mic, No Raise Hand) */}
              <TouchableOpacity
                style={[styles.leaveRoomButton, isRtl && styles.rtlRow]}
                onPress={() => setActiveJoinedRoom(null)}
                activeOpacity={0.8}
              >
                <SignOutIcon size={18} color="#F87171" />
                <Text style={styles.leaveRoomButtonText}>
                  {t.leaveRoom}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* ====== SUGGEST SURAH / TRACK MODAL (Lists of Surahs & Reciters) ====== */}
      {/* ======================================================== */}
      <Modal
        visible={isSuggestModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSuggestModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsSuggestModalOpen(false)}
          />
          <View style={styles.suggestModalSheet}>
            <View style={styles.sheetHandleBar} />

            {/* Header Row */}
            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>{t.suggestModalTitle}</Text>
              <TouchableOpacity
                onPress={() => setIsSuggestModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            {/* Current Selection Summary Bar */}
            <View style={[styles.suggestSelectionBanner, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.suggestBannerPill,
                  suggestTab === 'surah' && styles.suggestBannerPillActive,
                  isRtl && styles.rtlRow,
                ]}
                onPress={() => setSuggestTab('surah')}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestBannerLabel}>
                  {lang === 'ar' ? 'السورة:' : 'Surah:'}
                </Text>
                <Text style={styles.suggestBannerValue} numberOfLines={1}>
                  {lang === 'ar'
                    ? `سورة ${selectedSurahObj.nameAr}`
                    : `Surah ${selectedSurahObj.nameEn}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.suggestBannerPill,
                  suggestTab === 'reciter' && styles.suggestBannerPillActive,
                  isRtl && styles.rtlRow,
                ]}
                onPress={() => setSuggestTab('reciter')}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestBannerLabel}>
                  {lang === 'ar' ? 'القارئ:' : 'Qari:'}
                </Text>
                <Text style={styles.suggestBannerValue} numberOfLines={1}>
                  {lang === 'ar'
                    ? selectedReciterObj.nameAr
                    : selectedReciterObj.nameEn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-Tabs: 1. Surahs List (114) | 2. Reciters List */}
            <View style={[styles.suggestTabRow, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.suggestTabBtn,
                  suggestTab === 'surah' && styles.suggestTabBtnActive,
                ]}
                onPress={() => setSuggestTab('surah')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.suggestTabBtnText,
                    suggestTab === 'surah' && styles.suggestTabBtnTextActive,
                  ]}
                >
                  {lang === 'ar' ? 'سور القرآن (١١٤)' : 'Surahs (114)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.suggestTabBtn,
                  suggestTab === 'reciter' && styles.suggestTabBtnActive,
                ]}
                onPress={() => setSuggestTab('reciter')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.suggestTabBtnText,
                    suggestTab === 'reciter' && styles.suggestTabBtnTextActive,
                  ]}
                >
                  {lang === 'ar' ? 'القراء المشاهير' : 'Famous Reciters'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input for the active tab */}
            <View style={[styles.pickerSearchWrapper, isRtl && styles.searchBarRtl]}>
              <View style={styles.searchIconBox}>
                <SearchIcon size={16} color="#6B8E7C" />
              </View>
              <TextInput
                style={[
                  styles.pickerSearchInput,
                  isRtl && styles.rtlInput,
                  { fontFamily: FONTS.tajawal },
                ]}
                value={
                  suggestTab === 'surah'
                    ? surahSearchText
                    : reciterSearchText
                }
                onChangeText={
                  suggestTab === 'surah'
                    ? setSurahSearchText
                    : setReciterSearchText
                }
                placeholder={
                  suggestTab === 'surah'
                    ? lang === 'ar'
                      ? 'ابحث باسم السورة أو رقمها (١ - ١١٤)...'
                      : 'Search by surah name or number...'
                    : lang === 'ar'
                    ? 'ابحث باسم القارئ...'
                    : 'Search by reciter name...'
                }
                placeholderTextColor="#6B8E7C"
              />
              {(suggestTab === 'surah'
                ? surahSearchText
                : reciterSearchText
              ).length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    suggestTab === 'surah'
                      ? setSurahSearchText('')
                      : setReciterSearchText('')
                  }
                  style={styles.searchClearBtn}
                >
                  <CloseIcon size={16} color="#8A9E96" />
                </TouchableOpacity>
              )}
            </View>

            {/* List Section: All 114 Surahs or Famous Reciters */}
            {suggestTab === 'surah' ? (
              <ScrollView
                style={styles.pickerListScroll}
                contentContainerStyle={styles.pickerListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredSurahs.map((surah) => {
                  const isSelected = selectedSurahNumber === surah.number;
                  return (
                    <TouchableOpacity
                      key={surah.number}
                      style={[
                        styles.pickerItemRow,
                        isRtl && styles.rtlRow,
                        isSelected && styles.pickerItemRowSelected,
                      ]}
                      onPress={() => setSelectedSurahNumber(surah.number)}
                      activeOpacity={0.75}
                    >
                      {/* Surah Number Badge */}
                      <View
                        style={[
                          styles.surahNumBadge,
                          isSelected && styles.surahNumBadgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.surahNumText,
                            isSelected && styles.surahNumTextSelected,
                          ]}
                        >
                          {surah.number}
                        </Text>
                      </View>

                      {/* Surah Titles */}
                      <View
                        style={[
                          styles.pickerItemTextCol,
                          isRtl ? styles.alignRtl : styles.alignLtr,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerItemPrimary,
                            {
                              fontFamily:
                                lang === 'ar' ? FONTS.amiri : FONTS.tajawal,
                            },
                            isSelected && styles.pickerItemPrimarySelected,
                          ]}
                        >
                          {lang === 'ar'
                            ? `سورة ${surah.nameAr}`
                            : `Surah ${surah.nameEn}`}
                        </Text>
                        <Text style={styles.pickerItemSecondary}>
                          {lang === 'ar'
                            ? `${surah.nameEn} • ${surah.ayahsCount} آية • ${
                                surah.revelationType === 'meccan'
                                  ? 'مكية'
                                  : 'مدنية'
                              }`
                            : `${surah.nameAr} • ${surah.ayahsCount} verses • ${
                                surah.revelationType === 'meccan'
                                  ? 'Meccan'
                                  : 'Medinan'
                              }`}
                        </Text>
                      </View>

                      {/* Selected Checkmark */}
                      {isSelected ? (
                        <View style={styles.pickerCheckCircle}>
                          <CheckSmallIcon size={16} color="#0A221C" />
                        </View>
                      ) : (
                        <View style={styles.pickerUncheckCircle} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView
                style={styles.pickerListScroll}
                contentContainerStyle={styles.pickerListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredReciters.map((reciter) => {
                  const isSelected = selectedReciterId === reciter.id;
                  return (
                    <TouchableOpacity
                      key={reciter.id}
                      style={[
                        styles.pickerItemRow,
                        isRtl && styles.rtlRow,
                        isSelected && styles.pickerItemRowSelected,
                      ]}
                      onPress={() => setSelectedReciterId(reciter.id)}
                      activeOpacity={0.75}
                    >
                      {/* Qari Icon Badge */}
                      <View
                        style={[
                          styles.qariIconBadge,
                          isSelected && styles.qariIconBadgeSelected,
                        ]}
                      >
                        <HeadphonesIcon size={18} color="#D4AF37" />
                      </View>

                      {/* Reciter Details */}
                      <View
                        style={[
                          styles.pickerItemTextCol,
                          isRtl ? styles.alignRtl : styles.alignLtr,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerItemPrimary,
                            isSelected && styles.pickerItemPrimarySelected,
                          ]}
                        >
                          {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
                        </Text>
                        <Text style={styles.pickerItemSecondary}>
                          {lang === 'ar' ? reciter.styleAr : reciter.styleEn}
                        </Text>
                      </View>

                      {/* Selected Checkmark */}
                      {isSelected ? (
                        <View style={styles.pickerCheckCircle}>
                          <CheckSmallIcon size={16} color="#0A221C" />
                        </View>
                      ) : (
                        <View style={styles.pickerUncheckCircle} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Quick Ayah Selection Chips */}
            <View style={styles.ayahChipsSection}>
              <Text
                style={[
                  styles.ayahChipsTitle,
                  isRtl ? styles.alignRtlText : styles.alignLtrText,
                ]}
              >
                {lang === 'ar' ? 'نطاق الآيات:' : 'Ayah Range:'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.ayahChipsRow,
                  isRtl && styles.rtlRow,
                ]}
              >
                {[
                  { ar: 'كامل السورة', en: 'Full Surah' },
                  { ar: 'آية ١ – ١٠', en: 'Ayah 1–10' },
                  { ar: 'آية ١ – ٢٥', en: 'Ayah 1–25' },
                  { ar: 'آية ٢٥ – ٥٠', en: 'Ayah 25–50' },
                  { ar: 'أول ٥ آيات', en: 'First 5 Ayahs' },
                ].map((chip) => {
                  const label = lang === 'ar' ? chip.ar : chip.en;
                  const isSelected = suggestAyah === label;
                  return (
                    <TouchableOpacity
                      key={chip.en}
                      style={[
                        styles.ayahChipBtn,
                        isSelected && styles.ayahChipBtnSelected,
                      ]}
                      onPress={() => setSuggestAyah(label)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.ayahChipText,
                          isSelected && styles.ayahChipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Submit Button */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleAddSuggestedTrack}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>
                {t.suggestSubmitBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* ====== ENTER PRIVATE INVITE CODE MODAL ================= */}
      {/* ======================================================== */}
      <Modal
        visible={isInviteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdropCenter}
          activeOpacity={1}
          onPress={() => setIsInviteModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.inviteDialogCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.lockIconCircle}>
              <LockIcon size={26} color="#D4AF37" />
            </View>

            <Text style={styles.inviteTitleText}>{t.enterInviteCode}</Text>
            <Text style={styles.inviteSubText}>{t.visibilityPrivateDesc}</Text>

            <TextInput
              style={styles.inviteCodeInput}
              value={enteredInviteCode}
              onChangeText={setEnteredInviteCode}
              placeholder={t.inviteCodePlaceholder}
              placeholderTextColor="#6B8E7C"
              autoCapitalize="characters"
            />

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setIsInviteModalOpen(false)}
              >
                <Text style={styles.confirmCancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPrimaryBtn}
                onPress={() => {
                  setIsInviteModalOpen(false);
                }}
              >
                <Text style={styles.confirmPrimaryBtnText}>
                  {lang === 'ar' ? 'تأكيد الرمز' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ====== CREATE NEW CIRCLE MODAL ========================= */}
      {/* ======================================================== */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsCreateModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.createModalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandleBar} />

            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>
                {t.createRoomModalTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.createModalContent}
            >
              {/* Circle Title */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.roomTitleLabel}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                  value={newRoomTitle}
                  onChangeText={setNewRoomTitle}
                  placeholder={t.roomTitlePlaceholder}
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* Selected Surah & Reciter Preview Banner */}
              <View style={[styles.suggestSelectionBanner, isRtl && styles.rtlRow]}>
                <TouchableOpacity
                  style={[
                    styles.suggestBannerPill,
                    createTab === 'surah' && styles.suggestBannerPillActive,
                    isRtl && styles.rtlRow,
                  ]}
                  onPress={() => setCreateTab('surah')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestBannerLabel}>
                    {lang === 'ar' ? 'السورة:' : 'Surah:'}
                  </Text>
                  <Text style={styles.suggestBannerValue} numberOfLines={1}>
                    {lang === 'ar'
                      ? `سورة ${newRoomSurahObj.nameAr}`
                      : `Surah ${newRoomSurahObj.nameEn}`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.suggestBannerPill,
                    createTab === 'reciter' && styles.suggestBannerPillActive,
                    isRtl && styles.rtlRow,
                  ]}
                  onPress={() => setCreateTab('reciter')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestBannerLabel}>
                    {lang === 'ar' ? 'القارئ:' : 'Qari:'}
                  </Text>
                  <Text style={styles.suggestBannerValue} numberOfLines={1}>
                    {lang === 'ar'
                      ? newRoomReciterObj.nameAr
                      : newRoomReciterObj.nameEn}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sub-Tabs: 1. Surahs List (114) | 2. Reciters List */}
              <View style={[styles.suggestTabRow, isRtl && styles.rtlRow]}>
                <TouchableOpacity
                  style={[
                    styles.suggestTabBtn,
                    createTab === 'surah' && styles.suggestTabBtnActive,
                  ]}
                  onPress={() => setCreateTab('surah')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.suggestTabBtnText,
                      createTab === 'surah' && styles.suggestTabBtnTextActive,
                    ]}
                  >
                    {lang === 'ar' ? 'سور القرآن (١١٤)' : 'Surahs (114)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.suggestTabBtn,
                    createTab === 'reciter' && styles.suggestTabBtnActive,
                  ]}
                  onPress={() => setCreateTab('reciter')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.suggestTabBtnText,
                      createTab === 'reciter' && styles.suggestTabBtnTextActive,
                    ]}
                  >
                    {lang === 'ar' ? 'القراء المشاهير' : 'Famous Reciters'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar for Create Modal */}
              <View style={[styles.pickerSearchWrapper, isRtl && styles.searchBarRtl]}>
                <View style={styles.searchIconBox}>
                  <SearchIcon size={16} color="#6B8E7C" />
                </View>
                <TextInput
                  style={[
                    styles.pickerSearchInput,
                    isRtl && styles.rtlInput,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  value={
                    createTab === 'surah'
                      ? createSurahSearch
                      : createReciterSearch
                  }
                  onChangeText={
                    createTab === 'surah'
                      ? setCreateSurahSearch
                      : setCreateReciterSearch
                  }
                  placeholder={
                    createTab === 'surah'
                      ? lang === 'ar'
                        ? 'ابحث باسم السورة أو رقمها (١ - ١١٤)...'
                        : 'Search by surah name or number...'
                      : lang === 'ar'
                      ? 'ابحث باسم القارئ...'
                      : 'Search by reciter name...'
                  }
                  placeholderTextColor="#6B8E7C"
                />
                {(createTab === 'surah'
                  ? createSurahSearch
                  : createReciterSearch
                ).length > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      createTab === 'surah'
                        ? setCreateSurahSearch('')
                        : setCreateReciterSearch('')
                    }
                    style={styles.searchClearBtn}
                  >
                    <CloseIcon size={16} color="#8A9E96" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Scrollable Selector List inside Create Modal */}
              <View style={styles.createPickerListContainer}>
                {createTab === 'surah' ? (
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.createPickerScroll}
                    contentContainerStyle={styles.pickerListContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {createFilteredSurahs.map((surah) => {
                      const isSelected = newRoomSurahNumber === surah.number;
                      return (
                        <TouchableOpacity
                          key={surah.number}
                          style={[
                            styles.pickerItemRow,
                            isRtl && styles.rtlRow,
                            isSelected && styles.pickerItemRowSelected,
                          ]}
                          onPress={() => {
                            setNewRoomSurahNumber(surah.number);
                            if (
                              !newRoomTitle.trim() ||
                              newRoomTitle.startsWith('حلقة تدارس سورة') ||
                              newRoomTitle.includes('Study Circle')
                            ) {
                              setNewRoomTitle(
                                lang === 'ar'
                                  ? `حلقة تدارس سورة ${surah.nameAr}`
                                  : `Surah ${surah.nameEn} Study Circle`
                              );
                            }
                          }}
                          activeOpacity={0.75}
                        >
                          <View
                            style={[
                              styles.surahNumBadge,
                              isSelected && styles.surahNumBadgeSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.surahNumText,
                                isSelected && styles.surahNumTextSelected,
                              ]}
                            >
                              {surah.number}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.pickerItemTextCol,
                              isRtl ? styles.alignRtl : styles.alignLtr,
                            ]}
                          >
                            <Text
                              style={[
                                styles.pickerItemPrimary,
                                {
                                  fontFamily:
                                    lang === 'ar' ? FONTS.amiri : FONTS.tajawal,
                                },
                                isSelected && styles.pickerItemPrimarySelected,
                              ]}
                            >
                              {lang === 'ar'
                                ? `سورة ${surah.nameAr}`
                                : `Surah ${surah.nameEn}`}
                            </Text>
                            <Text style={styles.pickerItemSecondary}>
                              {lang === 'ar'
                                ? `${surah.nameEn} • ${surah.ayahsCount} آية • ${
                                    surah.revelationType === 'meccan'
                                      ? 'مكية'
                                      : 'مدنية'
                                  }`
                                : `${surah.nameAr} • ${surah.ayahsCount} verses • ${
                                    surah.revelationType === 'meccan'
                                      ? 'Meccan'
                                      : 'Medinan'
                                  }`}
                            </Text>
                          </View>

                          {isSelected ? (
                            <View style={styles.pickerCheckCircle}>
                              <CheckSmallIcon size={16} color="#0A221C" />
                            </View>
                          ) : (
                            <View style={styles.pickerUncheckCircle} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.createPickerScroll}
                    contentContainerStyle={styles.pickerListContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {createFilteredReciters.map((reciter) => {
                      const isSelected = newRoomReciterId === reciter.id;
                      return (
                        <TouchableOpacity
                          key={reciter.id}
                          style={[
                            styles.pickerItemRow,
                            isRtl && styles.rtlRow,
                            isSelected && styles.pickerItemRowSelected,
                          ]}
                          onPress={() => setNewRoomReciterId(reciter.id)}
                          activeOpacity={0.75}
                        >
                          <View
                            style={[
                              styles.qariIconBadge,
                              isSelected && styles.qariIconBadgeSelected,
                            ]}
                          >
                            <HeadphonesIcon size={18} color="#D4AF37" />
                          </View>

                          <View
                            style={[
                              styles.pickerItemTextCol,
                              isRtl ? styles.alignRtl : styles.alignLtr,
                            ]}
                          >
                            <Text
                              style={[
                                styles.pickerItemPrimary,
                                isSelected && styles.pickerItemPrimarySelected,
                              ]}
                            >
                              {lang === 'ar' ? reciter.nameAr : reciter.nameEn}
                            </Text>
                            <Text style={styles.pickerItemSecondary}>
                              {lang === 'ar' ? reciter.styleAr : reciter.styleEn}
                            </Text>
                          </View>

                          {isSelected ? (
                            <View style={styles.pickerCheckCircle}>
                              <CheckSmallIcon size={16} color="#0A221C" />
                            </View>
                          ) : (
                            <View style={styles.pickerUncheckCircle} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Visibility: Public vs Private */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? 'الظهور (عام / خاص)'
                    : 'Visibility (Public / Private)'}
                </Text>
                <View style={[styles.pillsRow, isRtl && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      newRoomVisibility === 'public' && styles.choicePillActive,
                    ]}
                    onPress={() => setNewRoomVisibility('public')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        newRoomVisibility === 'public' &&
                          styles.choicePillTextActive,
                      ]}
                    >
                      {t.visibilityPublic} (الافتراضي)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      newRoomVisibility === 'private' && styles.choicePillActive,
                    ]}
                    onPress={() => setNewRoomVisibility('private')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        newRoomVisibility === 'private' &&
                          styles.choicePillTextActive,
                      ]}
                    >
                      {t.visibilityPrivate} (للمدعوين)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* License Management */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar' ? 'رخصة التصويت' : 'Voting License'}
                </Text>
                <View style={styles.licenseSelectionCol}>
                  <TouchableOpacity
                    style={[
                      styles.licenseChoiceRow,
                      isRtl && styles.rtlRow,
                      newRoomLicense === 'open' && styles.licenseChoiceRowActive,
                    ]}
                    onPress={() => setNewRoomLicense('open')}
                  >
                    <View style={styles.licenseRadioCircle}>
                      {newRoomLicense === 'open' && (
                        <View style={styles.licenseRadioDot} />
                      )}
                    </View>
                    <View style={styles.licenseChoiceTextCol}>
                      <Text style={styles.licenseChoiceTitle}>
                        {t.licenseOpen} (الافتراضي)
                      </Text>
                      <Text style={styles.licenseChoiceSub}>
                        {t.licenseOpenDesc}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.licenseChoiceRow,
                      isRtl && styles.rtlRow,
                      newRoomLicense === 'invited_only' &&
                        styles.licenseChoiceRowActive,
                    ]}
                    onPress={() => setNewRoomLicense('invited_only')}
                  >
                    <View style={styles.licenseRadioCircle}>
                      {newRoomLicense === 'invited_only' && (
                        <View style={styles.licenseRadioDot} />
                      )}
                    </View>
                    <View style={styles.licenseChoiceTextCol}>
                      <Text style={styles.licenseChoiceTitle}>
                        {t.licenseInvitedOnly}
                      </Text>
                      <Text style={styles.licenseChoiceSub}>
                        {t.licenseInvitedOnlyDesc}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.licenseChoiceRow,
                      isRtl && styles.rtlRow,
                      newRoomLicense === 'place_and_time' &&
                        styles.licenseChoiceRowActive,
                    ]}
                    onPress={() => setNewRoomLicense('place_and_time')}
                  >
                    <View style={styles.licenseRadioCircle}>
                      {newRoomLicense === 'place_and_time' && (
                        <View style={styles.licenseRadioDot} />
                      )}
                    </View>
                    <View style={styles.licenseChoiceTextCol}>
                      <Text style={styles.licenseChoiceTitle}>
                        {t.licensePlaceAndTime}
                      </Text>
                      <Text style={styles.licenseChoiceSub}>
                        {t.licensePlaceAndTimeDesc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleCreateRoom}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  {t.startCircleAction}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0A221C',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A221C',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  alignRtl: {
    alignItems: 'flex-end',
  },
  alignLtr: {
    alignItems: 'flex-start',
  },
  alignRtlText: {
    textAlign: 'right',
  },
  alignLtrText: {
    textAlign: 'left',
  },

  /* Top Header */
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitles: {
    flex: 1,
  },
  screenTitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 23,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  screenSubtitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#8A9E96',
  },
  createCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  createCircleBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Status and testing banners */
  statusBannersBox: {
    marginBottom: 14,
    gap: 8,
  },
  liveStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  pulsingGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2DD4BF',
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2DD4BF',
  },
  licenseTestBar: {
    flexDirection: 'row',
    gap: 8,
  },
  testPill: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  testPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  testPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testPillText: {
    fontSize: 11,
    color: '#D4E2DC',
    fontWeight: '600',
  },

  /* Search Bar */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#133A30',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBarRtl: {
    flexDirection: 'row-reverse',
  },
  searchIconBox: {
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.tajawal,
    fontSize: 13.5,
    color: '#FFFFFF',
    height: '100%',
  },
  rtlInput: {
    textAlign: 'right',
  },

  /* Category Scroll */
  categoryScroll: {
    gap: 8,
    paddingBottom: 18,
  },
  rtlCategoryScroll: {
    flexDirection: 'row-reverse',
  },
  categoryPill: {
    backgroundColor: '#133A30',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderColor: '#D4AF37',
  },
  categoryPillText: {
    fontSize: 12.5,
    color: '#8A9E96',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },

  /* Featured Container */
  featuredContainer: {
    marginBottom: 24,
  },
  featuredCard: {
    backgroundColor: '#133A30',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  livePulseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulsingRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F87171',
  },
  livePulseTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visibilityBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  visibilityBadgeText: {
    fontSize: 11,
    color: '#2DD4BF',
    fontWeight: '700',
  },
  featuredListenersTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredListenersText: {
    fontSize: 11.5,
    color: '#D4E2DC',
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredHost: {
    fontSize: 13,
    color: '#D4AF37',
    marginBottom: 6,
    fontWeight: '600',
  },
  featuredSurah: {
    fontSize: 12.5,
    color: '#8A9E96',
    marginBottom: 10,
  },
  featuredQueueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 14,
  },
  featuredQueueBannerText: {
    fontSize: 12,
    color: '#E5C378',
    fontWeight: '600',
  },
  joinFeaturedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    width: '100%',
  },
  joinFeaturedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Circles List */
  circlesListSection: {
    marginBottom: 20,
  },
  circlesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  unlockPrivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
  },
  unlockPrivateBtnText: {
    fontSize: 11.5,
    color: '#D4AF37',
    fontWeight: '600',
  },
  circlesStack: {
    gap: 10,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#133A30',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  roomCardJoined: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    backgroundColor: '#174438',
  },
  roomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 142, 124, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomDetailsCol: {
    flex: 1,
  },
  roomBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  visibilityPillSmall: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visibilityPillPrivate: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  visibilityPillSmallText: {
    fontSize: 10,
    color: '#2DD4BF',
    fontWeight: '700',
  },
  licensePillPlace: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  licensePillPlaceText: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '600',
  },
  licensePillInvited: {
    backgroundColor: 'rgba(138, 158, 150, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  licensePillInvitedText: {
    fontSize: 10,
    color: '#8A9E96',
    fontWeight: '600',
  },
  roomTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  roomHost: {
    fontSize: 12,
    color: '#8A9E96',
    marginBottom: 2,
  },
  roomNextInQueue: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  roomActionCol: {
    alignItems: 'center',
    gap: 6,
  },
  liveListenersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2DD4BF',
  },
  liveListenersCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  roomJoinMiniBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  roomJoinMiniBtnActive: {
    backgroundColor: '#D4AF37',
  },
  roomJoinMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
  },
  roomJoinMiniBtnTextActive: {
    color: '#0A221C',
  },

  /* Active Room Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  activeRoomSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    height: '90%',
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingBottom: 26,
  },
  openVotePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  openVotePillText: {
    fontSize: 10.5,
    color: '#D4AF37',
    fontWeight: '700',
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  activeRoomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  activeRoomTitleBox: {
    flex: 1,
  },
  activeBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  activeLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  activeLivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  licenseTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  licenseTagActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
  },
  licenseTagLocked: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
  },
  licenseTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D4AF37',
  },
  activeRoomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activeRoomHost: {
    fontSize: 12.5,
    color: '#D4AF37',
  },
  roomLicenseNotice: {
    fontSize: 11,
    color: '#8A9E96',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  /* Currently Playing Box */
  currentlyPlayingBox: {
    backgroundColor: '#0A221C',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  playingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playingTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2DD4BF',
    letterSpacing: 0.5,
  },
  playingDuration: {
    fontSize: 11,
    color: '#8A9E96',
  },
  playingSurah: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playingQari: {
    fontSize: 12,
    color: '#8A9E96',
    marginBottom: 8,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    gap: 5,
  },
  waveBar1: { width: 3, height: 12, backgroundColor: '#D4AF37', borderRadius: 2 },
  waveBar2: { width: 3, height: 20, backgroundColor: '#D4AF37', borderRadius: 2 },
  waveBar3: { width: 3, height: 24, backgroundColor: '#2DD4BF', borderRadius: 2 },
  waveBar4: { width: 3, height: 16, backgroundColor: '#D4AF37', borderRadius: 2 },
  waveBar5: { width: 3, height: 26, backgroundColor: '#2DD4BF', borderRadius: 2 },
  waveBar6: { width: 3, height: 18, backgroundColor: '#D4AF37', borderRadius: 2 },
  waveBar7: { width: 3, height: 22, backgroundColor: '#D4AF37', borderRadius: 2 },
  waveBar8: { width: 3, height: 14, backgroundColor: '#2DD4BF', borderRadius: 2 },
  waveBar9: { width: 3, height: 10, backgroundColor: '#D4AF37', borderRadius: 2 },

  /* Live Queue Section */
  queueSectionBox: {
    backgroundColor: '#0E2821',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueTitles: {
    flex: 1,
  },
  queueMainTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  queueSubTitle: {
    fontSize: 11,
    color: '#8A9E96',
  },
  suggestTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  suggestTrackBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A221C',
  },
  competitionTieNoteText: {
    fontSize: 10.5,
    color: '#D4AF37',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  queueTrackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#133A30',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  queueTrackCardTop: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    backgroundColor: '#174438',
  },
  rankBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBoxTop: {
    backgroundColor: '#D4AF37',
  },
  rankNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9E96',
  },
  rankNumberTop: {
    color: '#0A221C',
  },
  queueTrackInfo: {
    flex: 1,
  },
  nextToPlayPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  nextToPlayPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4AF37',
  },
  queueSurahTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  queueAyahRange: {
    fontSize: 11,
    color: '#8A9E96',
    fontWeight: 'normal',
  },
  queueQariName: {
    fontSize: 11,
    color: '#D4AF37',
  },
  suggestedByText: {
    fontSize: 9.5,
    color: '#6B8E7C',
    marginTop: 2,
  },
  voteActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
  },
  voteActionBtnActive: {
    backgroundColor: '#D4AF37',
  },
  voteActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  voteActionBtnTextActive: {
    color: '#0A221C',
  },
  voteBtnSmallLabel: {
    fontSize: 9,
    color: '#8A9E96',
  },

  /* Leave Room Button */
  leaveRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.25)',
    marginTop: 10,
    marginBottom: 20,
  },
  leaveRoomButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },

  /* Create & Suggest Modal Sheets */
  createModalSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createModalContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4E2DC',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0A221C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choicePill: {
    flex: 1,
    backgroundColor: '#0A221C',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  choicePillActive: {
    backgroundColor: '#1B473A',
    borderColor: '#D4AF37',
  },
  choicePillText: {
    fontSize: 12,
    color: '#8A9E96',
    fontWeight: '600',
  },
  choicePillTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  licenseSelectionCol: {
    gap: 8,
  },
  licenseChoiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0A221C',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  licenseChoiceRowActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#163E32',
  },
  licenseRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  licenseRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
  licenseChoiceTextCol: {
    flex: 1,
  },
  licenseChoiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  licenseChoiceSub: {
    fontSize: 11,
    color: '#8A9E96',
    lineHeight: 15,
  },
  primaryActionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Invite Code Modal */
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inviteDialogCard: {
    backgroundColor: '#133A30',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  lockIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  inviteTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  inviteSubText: {
    fontSize: 12,
    color: '#8A9E96',
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteCodeInput: {
    backgroundColor: '#0A221C',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: '100%',
    marginBottom: 18,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#174438',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  confirmPrimaryBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* ================= SUGGEST TRACK LIST SELECTOR STYLES ================= */
  suggestModalSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    height: '92%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  suggestSelectionBanner: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  suggestBannerPill: {
    flex: 1,
    backgroundColor: '#0A221C',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestBannerPillActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#14382E',
  },
  suggestBannerLabel: {
    fontSize: 11,
    color: '#8A9E96',
    fontWeight: '600',
  },
  suggestBannerValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D4AF37',
    flex: 1,
  },
  suggestTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0A221C',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 6,
  },
  suggestTabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  suggestTabBtnActive: {
    backgroundColor: '#D4AF37',
  },
  suggestTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9E96',
  },
  suggestTabBtnTextActive: {
    color: '#0A221C',
  },
  pickerSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A221C',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    height: '100%',
    marginHorizontal: 8,
  },
  searchClearBtn: {
    padding: 4,
  },
  pickerListScroll: {
    flex: 1,
    marginBottom: 10,
  },
  pickerListContent: {
    paddingBottom: 8,
    gap: 6,
  },
  pickerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E2821',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  pickerItemRowSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#163E32',
  },
  surahNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumBadgeSelected: {
    backgroundColor: '#D4AF37',
  },
  surahNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  surahNumTextSelected: {
    color: '#0A221C',
  },
  qariIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qariIconBadgeSelected: {
    backgroundColor: '#D4AF37',
  },
  qariEmoji: {
    fontSize: 16,
  },
  pickerItemTextCol: {
    flex: 1,
  },
  pickerItemPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pickerItemPrimarySelected: {
    color: '#D4AF37',
  },
  pickerItemSecondary: {
    fontSize: 11,
    color: '#8A9E96',
  },
  pickerCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerUncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ayahChipsSection: {
    marginBottom: 12,
  },
  ayahChipsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A9E96',
    marginBottom: 6,
  },
  ayahChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  ayahChipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ayahChipBtnSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  ayahChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A9E96',
  },
  ayahChipTextSelected: {
    color: '#0A221C',
    fontWeight: '700',
  },
  quickSurahRow: {
    gap: 8,
    marginTop: 8,
    paddingVertical: 4,
  },
  quickSurahChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  quickSurahChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  quickSurahChipText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '600',
  },
  quickSurahChipTextActive: {
    color: '#0A221C',
    fontWeight: '700',
  },
  createPickerListContainer: {
    height: 190,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 6,
  },
  createPickerScroll: {
    flex: 1,
  },
});
