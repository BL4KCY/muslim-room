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
import { clearMobileSession } from '../services/api';
import {
  MobileLanguage,
  MOBILE_TRANSLATIONS,
} from '../i18n/translations';
import { ProfileScreen } from './ProfileScreen';
import { CommunityScreen } from './CommunityScreen';
import { PlaylistScreen } from './PlaylistScreen';
import {
  SearchIcon,
  CommunityIcon,
  PlayShortcutIcon,
  NavHomeIcon,
  NavPlaylistIcon,
  NavCommunityIcon,
  NavProfileIcon,
  ChevronRightIcon,
  ClockIcon,
  FolderIcon,
  PodcastIcon,
  ThreeDotsIcon,
  GlobeIcon,
  SignOutIcon,
  PlayIcon,
  PauseIcon,
} from '../components/HomeIcons';

const MUSLIM_AVATAR = require('../../assets/young.png');

type TabKey = 'home' | 'playlist' | 'community' | 'profile';

interface RecentRecitation {
  id: string;
  surahPillEn: string;
  surahPillAr: string;
  primaryQariEn: string;
  primaryQariAr: string;
  secondaryQariEn: string;
  secondaryQariAr: string;
  duration: string;
}

const RECENT_RECITATIONS: RecentRecitation[] = [
  {
    id: 'rec-kahf',
    surahPillEn: 'Surah Al-Kahf (1–10)',
    surahPillAr: 'سورة الكهف (١-١٠)',
    primaryQariEn: 'Mishary Rashid Alafasy',
    primaryQariAr: 'مشاري راشد العفاسي',
    secondaryQariEn: 'AbdulBaset AbdulSamad',
    secondaryQariAr: 'عبد الباسط عبد الصمد',
    duration: '06:45',
  },
  {
    id: 'rec-rahman',
    surahPillEn: 'Surah Ar-Rahman',
    surahPillAr: 'سورة الرحمن',
    primaryQariEn: 'AbdulBaset AbdulSamad',
    primaryQariAr: 'عبد الباسط عبد الصمد',
    secondaryQariEn: 'Mishary Rashid Alafasy',
    secondaryQariAr: 'مشاري راشد العفاسي',
    duration: '04:12',
  },
  {
    id: 'rec-yasin',
    surahPillEn: 'Surah Ya-Sin (1–19)',
    surahPillAr: 'سورة يسٓ (١-١٩)',
    primaryQariEn: 'Mahmoud Khalil Al-Husary',
    primaryQariAr: 'محمود خليل الحصري',
    secondaryQariEn: 'Nasser Al Qatami',
    secondaryQariAr: 'ناصر القطامي',
    duration: '05:20',
  },
  {
    id: 'rec-mulk',
    surahPillEn: 'Surah Al-Mulk',
    surahPillAr: 'سورة الملك',
    primaryQariEn: 'Nasser Al Qatami',
    primaryQariAr: 'ناصر القطامي',
    secondaryQariEn: 'Saad Al-Ghamdi',
    secondaryQariAr: 'سعد الغامدي',
    duration: '03:45',
  },
];

interface CommunityItem {
  id: string;
  nameEn: string;
  nameAr: string;
  hostEn: string;
  hostAr: string;
  surahEn: string;
  surahAr: string;
  listeners: number;
}

const SAMPLE_COMMUNITIES: CommunityItem[] = [
  {
    id: 'c-1',
    nameEn: 'Jumu’ah Nur Circle',
    nameAr: 'حلقة نور الجمعة المباركة',
    hostEn: 'Sheikh Tariq',
    hostAr: 'الشيخ طارق',
    surahEn: 'Surah Al-Kahf',
    surahAr: 'سورة الكهف',
    listeners: 184,
  },
  {
    id: 'c-2',
    nameEn: 'Masjid Al-Noor Tadabbur',
    nameAr: 'مجلس تدبر مسجد النور',
    hostEn: 'Imam Zaid Al-Ansari',
    hostAr: 'الإمام زيد الأنصاري',
    surahEn: 'Surah Ar-Rahman',
    surahAr: 'سورة الرحمن',
    listeners: 62,
  },
  {
    id: 'c-3',
    nameEn: 'Fajr Hifz & Muraja’ah',
    nameAr: 'حلقة الفجر للحفظ والمراجعة',
    hostEn: 'Hafiz Yusuf M.',
    hostAr: 'الحافظ يوسف',
    surahEn: 'Juz’ Amma',
    surahAr: 'جزء عم',
    listeners: 28,
  },
];

interface PlaylistFolderItem {
  id: string;
  kind: 'folder' | 'podcast';
  titleKey: 'folder1Title' | 'folder2Title' | 'folder3Title';
  subtitleKey: 'folder1Subtitle' | 'folder2Subtitle' | 'folder3Subtitle';
  badgeKey: 'folder1Badge' | 'folder2Badge' | 'folder3Badge';
  metaKey: 'folder1Meta' | 'folder2Meta' | 'folder3Meta';
}

const SAMPLE_PLAYLIST_FOLDERS: PlaylistFolderItem[] = [
  {
    id: 'f-1',
    kind: 'folder',
    titleKey: 'folder1Title',
    subtitleKey: 'folder1Subtitle',
    badgeKey: 'folder1Badge',
    metaKey: 'folder1Meta',
  },
  {
    id: 'f-2',
    kind: 'podcast',
    titleKey: 'folder2Title',
    subtitleKey: 'folder2Subtitle',
    badgeKey: 'folder2Badge',
    metaKey: 'folder2Meta',
  },
  {
    id: 'f-3',
    kind: 'folder',
    titleKey: 'folder3Title',
    subtitleKey: 'folder3Subtitle',
    badgeKey: 'folder3Badge',
    metaKey: 'folder3Meta',
  },
];

interface HomeScreenProps {
  lang: MobileLanguage;
  onToggleLang: () => void;
  user: MobileUser;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  lang,
  onToggleLang,
  user,
  onLogout,
}) => {
  const t = MOBILE_TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string>('rec-kahf');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenPlaylist = (folderId: string) => {
    const mapId: Record<string, string> = {
      'f-1': 'pl-wird-evening',
      'f-2': 'pl-tadabbur-podcast',
      'f-3': 'pl-rare-masterpieces',
    };
    setSelectedPlaylistId(mapId[folderId] || 'pl-wird-evening');
    setActiveTab('playlist');
  };

  const handleTogglePlay = (id: string) => {
    setActivePlayingId((prev) => (prev === id ? '' : id));
  };

  const isRtl = t.isRtl;

  return (
    <View style={styles.screen}>
      {activeTab === 'profile' ? (
        <ProfileScreen
          lang={lang}
          onToggleLang={onToggleLang}
          user={user}
          onLogout={onLogout}
          onBackToHome={() => setActiveTab('home')}
        />
      ) : activeTab === 'community' ? (
        <CommunityScreen
          lang={lang}
          onToggleLang={onToggleLang}
          user={user}
          onBackToHome={() => setActiveTab('home')}
        />
      ) : activeTab === 'playlist' ? (
        <PlaylistScreen
          lang={lang}
          onToggleLang={onToggleLang}
          user={user}
          onBackToHome={() => setActiveTab('home')}
          initialSelectedPlaylistId={selectedPlaylistId}
        />
      ) : (
        /* Scrollable Main Content */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header: Greeting with User Avatar & Actions */}
          <View style={[styles.topGreetingRow, isRtl && styles.rtlRow]}>
            {/* User Avatar + Greeting Text (Tappable to go to Profile) */}
            <TouchableOpacity
              style={[styles.userBlock, isRtl && styles.rtlRow]}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.8}
            >
              <View style={styles.homeAvatarRing}>
                <Image
                  source={MUSLIM_AVATAR}
                  style={styles.homeAvatarImage}
                  resizeMode="cover"
                />
              </View>
              <View
                style={[
                  styles.greetingTextBlock,
                  isRtl ? styles.greetingBlockRtl : styles.greetingBlockLtr,
                ]}
              >
                <Text
                  style={[
                    styles.greetingSub,
                    { fontFamily: FONTS.tajawal },
                  ]}
                >
                  {t.greeting}
                </Text>
                <Text
                  style={[
                    styles.greetingName,
                    { fontFamily: FONTS.tajawal },
                  ]}
                >
                  {user.displayName || (lang === 'ar' ? 'زياد القارئ' : 'Ziad Al-Qari')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sleek Minimal Three-Dot Button */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.threeDotsBtn}
                onPress={() => setIsMenuOpen(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ThreeDotsIcon size={20} color="#8A9E96" />
              </TouchableOpacity>

              {/* Elegant Dropdown Modal */}
              <Modal
                transparent
                visible={isMenuOpen}
                animationType="fade"
                onRequestClose={() => setIsMenuOpen(false)}
              >
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={() => setIsMenuOpen(false)}
                >
                  <View
                    style={[
                      styles.menuDropdown,
                      isRtl ? styles.menuDropdownRtl : styles.menuDropdownLtr,
                    ]}
                  >
                    {/* View Profile */}
                    <TouchableOpacity
                      style={[styles.menuItem, isRtl && styles.menuItemRtl]}
                      onPress={() => {
                        setIsMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      activeOpacity={0.75}
                    >
                      <NavProfileIcon size={18} color="#D4AF37" />
                      <Text style={styles.menuItemText}>{t.navProfile}</Text>
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    {/* Change Language Item */}
                    <TouchableOpacity
                      style={[styles.menuItem, isRtl && styles.menuItemRtl]}
                      onPress={() => {
                        setIsMenuOpen(false);
                        onToggleLang();
                      }}
                      activeOpacity={0.75}
                    >
                      <GlobeIcon size={18} color="#6B8E7C" />
                      <Text style={styles.menuItemText}>{t.changeLanguageLabel}</Text>
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    {/* Sign Out Item */}
                    <TouchableOpacity
                      style={[styles.menuItem, isRtl && styles.menuItemRtl]}
                      onPress={() => {
                        setIsMenuOpen(false);
                        clearMobileSession();
                        onLogout();
                      }}
                      activeOpacity={0.75}
                    >
                      <SignOutIcon size={18} color="#F87171" />
                      <Text style={[styles.menuItemText, styles.menuSignOutText]}>
                        {t.menuSignOut}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Top: Sleek, Pill-Shaped Search Bar */}
          <View style={[styles.searchBarWrapper, isRtl && styles.searchBarRtl]}>
            <TextInput
              style={[
                styles.searchInput,
                isRtl && styles.rtlInput,
                { fontFamily: FONTS.tajawal },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#6B8E7C"
              returnKeyType="search"
            />
            <View style={styles.searchIconBox}>
              <SearchIcon size={20} color="#6B8E7C" />
            </View>
          </View>

          {/* ================= 1. RECENT RECITATIONS (التلاوات الأخيرة) CAROUSEL ================= */}
          <View style={styles.recentSection}>
            {/* Section Header: Title & "رؤية الكل >" */}
            <View style={[styles.recentSectionHeader, isRtl && styles.rtlHeader]}>
              <Text
                style={[
                  styles.recentSectionTitle,
                  { fontFamily: FONTS.tajawal },
                ]}
              >
                {t.recentRecitationsTitle}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedPlaylistId('');
                  setActiveTab('playlist');
                }}
                activeOpacity={0.7}
                style={styles.exploreButtonUp}
              >
                <Text style={styles.exploreButtonText}>{t.seeAllBtn}</Text>
                <View style={[styles.arrowSmall, isRtl && styles.rtlArrow]}>
                  <ChevronRightIcon size={13} color="#D4AF37" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Horizontal Swiping Carousel of Borderless Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentCarouselScroll}
            >
              {RECENT_RECITATIONS.map((item) => {
                const isPlaying = activePlayingId === item.id;
                return (
                  <View key={item.id} style={styles.recentCard}>
                    {/* Top Surah Pill - Holy Quran surah title uses Amiri */}
                    <View style={styles.surahBadgePill}>
                      <Text
                        style={[
                          styles.surahBadgeText,
                          { fontFamily: lang === 'ar' ? FONTS.amiri : FONTS.tajawal },
                        ]}
                      >
                        {lang === 'ar' ? item.surahPillAr : item.surahPillEn}
                      </Text>
                    </View>

                    {/* Primary Reciter */}
                    <Text style={styles.primaryQariText} numberOfLines={1}>
                      {lang === 'ar' ? item.primaryQariAr : item.primaryQariEn}
                    </Text>

                    {/* Secondary Reciter / Annotation */}
                    <Text style={styles.secondaryQariText} numberOfLines={1}>
                      {lang === 'ar' ? item.secondaryQariAr : item.secondaryQariEn}
                    </Text>

                    {/* Bottom Footer: Gold Play Button on Left & Clock Duration on Right */}
                    <View style={styles.recentCardFooter}>
                      <TouchableOpacity
                        style={[
                          styles.goldPlayButton,
                          isPlaying && styles.goldPlayButtonActive,
                        ]}
                        onPress={() => handleTogglePlay(item.id)}
                        activeOpacity={0.85}
                      >
                        {isPlaying ? (
                          <PauseIcon size={14} color="#0A221C" />
                        ) : (
                          <PlayIcon size={14} color="#0A221C" />
                        )}
                      </TouchableOpacity>

                      <View style={styles.durationClockBox}>
                        <ClockIcon size={13} color="#6B8E7C" />
                        <Text style={styles.durationClockText}>{item.duration}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* ================= 2. ACTIVE STUDY ROOMS (حلقات التدارس النشطة) ================= */}
          <View style={styles.sectionBlock}>
            {/* Header Row: Title & "استكشف >" */}
            <View style={[styles.recentSectionHeader, isRtl && styles.rtlHeader]}>
              <Text
                style={[
                  styles.recentSectionTitle,
                  { fontFamily: FONTS.tajawal },
                ]}
              >
                {t.communityCardTitle}
              </Text>

              <TouchableOpacity
                style={styles.exploreButtonUp}
                onPress={() => setActiveTab('community')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>{t.exploreBtn}</Text>
                <View style={[styles.arrowSmall, isRtl && styles.rtlArrow]}>
                  <ChevronRightIcon size={13} color="#D4AF37" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 3 SEPARATE INDIVIDUAL RECTANGULAR CARDS (Matching the Screenshot Exactly) */}
            <View style={styles.studyRoomsStack}>
              {SAMPLE_COMMUNITIES.map((community) => (
                <TouchableOpacity
                  key={community.id}
                  style={[
                    styles.individualStudyCard,
                    isRtl && styles.rtlRow,
                  ]}
                  onPress={() => setActiveTab('community')}
                  activeOpacity={0.6}
                >
                    {/* Community / People Icon */}
                    <View style={styles.studyCardIconBox}>
                      <CommunityIcon size={22} color="#6B8E7C" />
                    </View>

                    {/* Center Text Details */}
                    <View
                      style={[
                        styles.studyCardTextBox,
                        isRtl ? styles.alignRtl : styles.alignLtr,
                      ]}
                    >
                      <Text
                        style={[
                          styles.studyCardTitle,
                          { fontFamily: FONTS.tajawal },
                        ]}
                        numberOfLines={1}
                      >
                        {lang === 'ar' ? community.nameAr : community.nameEn}
                      </Text>
                      <Text style={styles.studyCardSubtitle} numberOfLines={1}>
                        {lang === 'ar'
                          ? `${community.hostAr} • ${community.surahAr}`
                          : `${community.hostEn} • ${community.surahEn}`}
                      </Text>
                    </View>

                    {/* Live Listeners Badge (● 184) */}
                    <View style={styles.liveListenersBadge}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.liveListenersText}>
                        {community.listeners}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* ================= 3. PLAYLIST SHORTCUT: FOLDERS & PODCASTS (قوائم ومجلدات الاستماع) ================= */}
          <View style={styles.sectionBlock}>
            {/* Header Row */}
            <View style={[styles.recentSectionHeader, isRtl && styles.rtlHeader]}>
              <Text
                style={[
                  styles.recentSectionTitle,
                  { fontFamily: FONTS.tajawal },
                ]}
              >
                {t.playlistCardTitle}
              </Text>

              <TouchableOpacity
                style={styles.exploreButtonUp}
                onPress={() => {
                  setSelectedPlaylistId('');
                  setActiveTab('playlist');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>{t.exploreBtn}</Text>
                <View style={[styles.arrowSmall, isRtl && styles.rtlArrow]}>
                  <ChevronRightIcon size={13} color="#D4AF37" />
                </View>
              </TouchableOpacity>
            </View>

            {/* BORDERLESS Playlist / Folders Card */}
            <View style={styles.borderlessCard}>
              {SAMPLE_PLAYLIST_FOLDERS.map((folder, index) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderItemRow,
                    index < SAMPLE_PLAYLIST_FOLDERS.length - 1 && styles.itemDivider,
                  ]}
                  onPress={() => handleOpenPlaylist(folder.id)}
                  activeOpacity={0.6}
                >
                    {/* Folder / Podcast Icon Circle */}
                    <View style={styles.folderIconCircle}>
                      {folder.kind === 'podcast' ? (
                        <PodcastIcon size={20} color="#D4AF37" />
                      ) : (
                        <FolderIcon size={20} color="#D4AF37" />
                      )}
                    </View>

                    {/* Folder Details */}
                    <View style={styles.itemContentBlock}>
                      <View style={styles.folderTitleLine}>
                        <Text
                          style={[
                            styles.itemTitle,
                            { fontFamily: FONTS.tajawal },
                          ]}
                          numberOfLines={1}
                        >
                          {t[folder.titleKey]}
                        </Text>
                      </View>
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {t[folder.subtitleKey]}
                      </Text>
                    </View>

                    {/* Folder Metadata / Category Badge */}
                    <View style={styles.folderMetaBadge}>
                      <Text style={styles.folderMetaBadgeText}>
                        {t[folder.badgeKey]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Peaceful Reflection Footer */}
          <View style={styles.peacefulFooter}>
            <Text style={styles.peacefulQuote}>
              {lang === 'ar'
                ? '﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾'
                : '“Verily, in the remembrance of Allah do hearts find rest.”'}
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Bottom: Clean Bottom Navigation Bar with 4 Minimalist Icons Evenly Spaced */}
      <View style={styles.bottomNav}>
        {/* 1. Home (Highlighted in glowing gold #D4AF37) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <View style={styles.navIconBox}>
            <NavHomeIcon
              size={22}
              color={activeTab === 'home' ? '#D4AF37' : '#6B8E7C'}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home'
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            {t.navHome}
          </Text>
          {activeTab === 'home' && <View style={styles.activeGlowDot} />}
        </TouchableOpacity>

        {/* 2. Playlist (Muted sage green #6B8E7C) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setSelectedPlaylistId('');
            setActiveTab('playlist');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.navIconBox}>
            <NavPlaylistIcon
              size={22}
              color={activeTab === 'playlist' ? '#D4AF37' : '#6B8E7C'}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'playlist'
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            {t.navPlaylist}
          </Text>
          {activeTab === 'playlist' && <View style={styles.activeGlowDot} />}
        </TouchableOpacity>

        {/* 3. Community (Muted sage green #6B8E7C) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('community')}
          activeOpacity={0.8}
        >
          <View style={styles.navIconBox}>
            <NavCommunityIcon
              size={22}
              color={activeTab === 'community' ? '#D4AF37' : '#6B8E7C'}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'community'
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            {t.navCommunity}
          </Text>
          {activeTab === 'community' && <View style={styles.activeGlowDot} />}
        </TouchableOpacity>

        {/* 4. Profile (Muted sage green #6B8E7C) */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <View style={styles.navIconBox}>
            <NavProfileIcon
              size={22}
              color={activeTab === 'profile' ? '#D4AF37' : '#6B8E7C'}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile'
                ? styles.navLabelActive
                : styles.navLabelInactive,
            ]}
          >
            {t.navProfile}
          </Text>
          {activeTab === 'profile' && <View style={styles.activeGlowDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A221C', // Solid deep emerald green
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
  },

  /* Top Greeting & User Avatar Header */
  topGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  userBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  homeAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold ring matching screenshot
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  homeAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
    backgroundColor: '#F4EFE6',
  },
  greetingTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingBlockLtr: {
    alignItems: 'flex-start',
  },
  greetingBlockRtl: {
    alignItems: 'flex-end',
  },
  greetingSub: {
    fontSize: 13.5,
    color: '#8A9E96',
    letterSpacing: 0.2,
  },
  greetingName: {
    fontSize: 25,
    fontWeight: '700',
    color: '#D4AF37', // Radiant Gold
    letterSpacing: 0.3,
    marginTop: 1,
  },

  /* Sleek Three-Dot Menu */
  menuContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#133A30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 76 : 58,
    backgroundColor: '#133A30',
    borderRadius: 16,
    paddingVertical: 6,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  menuDropdownLtr: {
    right: 20,
  },
  menuDropdownRtl: {
    left: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  menuItemRtl: {
    flexDirection: 'row-reverse',
  },
  menuItemIcon: {
    fontSize: 16,
  },
  menuItemText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuSignOutText: {
    color: '#F87171',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },

  /* Sleek, Pill-Shaped Search Bar */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#133A30',
    borderRadius: 25, // Sleek pill-shape
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 18,
    marginBottom: 26,
  },
  searchBarRtl: {
    flexDirection: 'row-reverse',
  },
  searchIconBox: {
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%',
  },
  rtlInput: {
    textAlign: 'right',
  },

  /* ================= RECENT RECITATIONS SECTION ================= */
  recentSection: {
    marginBottom: 28,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rtlHeader: {
    flexDirection: 'row-reverse',
  },
  recentSectionTitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#8A9E96',
    fontWeight: '500',
  },

  /* Horizontal Swiping Carousel */
  recentCarouselScroll: {
    gap: 14,
    paddingRight: 10,
  },
  recentCard: {
    width: 205,
    backgroundColor: '#133A30',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  surahBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 14,
    marginBottom: 10,
  },
  surahBadgeText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryQariText: {
    fontFamily: FONTS.tajawal,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  secondaryQariText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    color: '#6B8E7C',
    textAlign: 'center',
    marginBottom: 14,
  },
  recentCardFooter: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  goldPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37', // Solid Gold Play Button
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldPlayButtonActive: {
    backgroundColor: '#F0CE63',
  },
  playArrowIcon: {
    fontSize: 12,
    color: '#0A221C',
    fontWeight: '900',
    marginLeft: 2,
  },
  durationClockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  durationClockText: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#8A9E96',
    fontWeight: '600',
  },

  /* ================= COMMON SECTION BLOCKS ================= */
  sectionBlock: {
    marginBottom: 26,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  shortcutTag: {
    fontFamily: FONTS.tajawal,
    fontSize: 10.5,
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 21,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  exploreButtonUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  exploreButtonText: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.2,
  },
  arrowSmall: {
    marginTop: 1,
  },
  rtlArrow: {
    transform: [{ rotate: '180deg' }],
  },

  cleanSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  studyRoomsStack: {
    gap: 10,
  },
  individualStudyCard: {
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
  individualStudyCardSelected: {
    backgroundColor: '#174438',
    borderColor: '#D4AF37',
  },
  studyCardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(107, 142, 124, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyCardTextBox: {
    flex: 1,
  },
  studyCardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  studyCardSubtitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#8A9E96',
  },
  alignRtl: {
    alignItems: 'flex-end',
  },
  alignLtr: {
    alignItems: 'flex-start',
  },

  /* Card */
  borderlessCard: {
    backgroundColor: '#133A30',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  /* Community Items */
  communityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  /* Folder Items */
  folderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  folderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  folderTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderMetaBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  folderMetaBadgeText: {
    fontFamily: FONTS.tajawal,
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Shared Row Elements */
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemRowSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  itemContentBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#8A9E96',
  },
  liveListenersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  liveGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2DD4BF',
  },
  liveListenersText: {
    fontFamily: FONTS.tajawal,
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Peaceful Quranic Reflection */
  peacefulFooter: {
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  peacefulQuote: {
    fontFamily: FONTS.amiri,
    color: 'rgba(212, 175, 55, 0.55)',
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Clean Bottom Navigation Bar */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#08231cff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.14)',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navIconBox: {
    marginBottom: 4,
    height: 24,
    justifyContent: 'center',
  },
  navLabel: {
    fontFamily: FONTS.tajawal,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  navLabelActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  navLabelInactive: {
    color: '#6B8E7C',
  },
  activeGlowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    marginTop: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
});
