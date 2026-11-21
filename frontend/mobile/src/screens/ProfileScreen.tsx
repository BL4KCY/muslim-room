import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { MobileUser } from './AuthScreen';
import { clearMobileSession } from '../services/api';
import { MobileLanguage, MOBILE_TRANSLATIONS } from '../i18n/translations';
import {
  SettingsIcon,
  CommunityIcon,
  HeadphonesIcon,
  QuranBookIcon,
  FlameStreakIcon,
  SealCheckIcon,
  NavProfileIcon,
  BookmarkRibbonIcon,
  NotificationBellIcon,
  GlobeIcon,
  SignOutIcon,
  ChevronRightIcon,
  CloseIcon,
  CheckSmallIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
} from '../components/HomeIcons';

const MUSLIM_AVATAR = require('../../assets/young.png');

type SettingsModalType =
  | 'none'
  | 'personalInfo'
  | 'favPlaylists'
  | 'notifications'
  | 'generalSettings'
  | 'signOutConfirm';

interface FavoriteItem {
  id: string;
  titleAr: string;
  titleEn: string;
  qariAr: string;
  qariEn: string;
  duration: string;
}

const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-1',
    titleAr: 'سورة الكهف (١-١٠)',
    titleEn: 'Surah Al-Kahf (1–10)',
    qariAr: 'مشاري راشد العفاسي',
    qariEn: 'Mishary Rashid Alafasy',
    duration: '06:45',
  },
  {
    id: 'fav-2',
    titleAr: 'سورة الرحمن كاملة',
    titleEn: 'Surah Ar-Rahman',
    qariAr: 'عبد الباسط عبد الصمد',
    qariEn: 'AbdulBaset AbdulSamad',
    duration: '04:12',
  },
  {
    id: 'fav-3',
    titleAr: 'خواطر وتدبر آيات السكينة',
    titleEn: 'Quranic Tadabbur Podcast',
    qariAr: 'الشيخ طارق وضيوفه',
    qariEn: 'Sheikh Tariq & Guests',
    duration: '18:30',
  },
  {
    id: 'fav-4',
    titleAr: 'حلقة نور الجمعة المباركة',
    titleEn: 'Jumu’ah Circle Session',
    qariAr: 'مجلس مباشر مسجل',
    qariEn: 'Live Recorded Session',
    duration: '45:10',
  },
];

interface ProfileScreenProps {
  lang: MobileLanguage;
  onToggleLang: () => void;
  user: MobileUser;
  onLogout: () => void;
  onBackToHome: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  lang,
  onToggleLang,
  user,
  onLogout,
  onBackToHome,
}) => {
  const t = MOBILE_TRANSLATIONS[lang];
  const isRtl = t.isRtl;

  // Modals state
  const [activeModal, setActiveModal] = useState<SettingsModalType>('none');

  // Personal Info Form State
  const [displayName, setDisplayName] = useState(
    user.displayName || (lang === 'ar' ? 'زياد القارئ' : 'Ziad Al-Qari')
  );
  const [userEmail, setUserEmail] = useState(
    user.maskedEmail || 'ziad@quranroom.app'
  );
  const [wirdGoal, setWirdGoal] = useState<'half' | 'full' | 'double'>('full');
  const [preferredReciter, setPreferredReciter] = useState<
    'mishary' | 'abdulbaset' | 'husary'
  >('mishary');
  const [saveBannerVisible, setSaveBannerVisible] = useState(false);

  // Notifications State
  const [notifDailyWird, setNotifDailyWird] = useState(true);
  const [notifKahfFriday, setNotifKahfFriday] = useState(true);
  const [notifHalaqahs, setNotifHalaqahs] = useState(true);
  const [notifAdhkar, setNotifAdhkar] = useState(false);

  // General Settings State
  const [audioQuality, setAudioQuality] = useState<'320' | '128' | '64'>('320');
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [quranScript, setQuranScript] = useState<'hafs' | 'warsh'>('hafs');

  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [playingFavId, setPlayingFavId] = useState<string | null>(null);

  const handleSignOut = () => {
    setActiveModal('none');
    clearMobileSession();
    onLogout();
  };

  const handleSavePersonalInfo = () => {
    setSaveBannerVisible(true);
    setTimeout(() => {
      setSaveBannerVisible(false);
      setActiveModal('none');
    }, 900);
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section: Large Golden-Rimmed Avatar + Name + Join Date */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarRing}
            onPress={() => setActiveModal('personalInfo')}
            activeOpacity={0.85}
          >
            <Image
              source={MUSLIM_AVATAR}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.userNameText,
              { fontFamily: FONTS.tajawal },
            ]}
          >
            {displayName}
          </Text>

          <Text style={styles.memberSinceText}>{t.profileMemberSince}</Text>
        </View>

        {/* 2x2 Stats Grid (مطابق للصورة تماماً) */}
        <View style={styles.statsGrid}>
          {/* Row 1: الحلقات النشطة (Right) | دقائق الاستماع (Left) */}
          <View style={[styles.statsGridRow, isRtl && styles.rtlRow]}>
            {/* Card 1: الحلقات النشطة */}
            <View style={[styles.statBox, isRtl && styles.rtlRow]}>
              <View style={styles.statIconWrapper}>
                <CommunityIcon size={22} color="#6B8E7C" />
              </View>
              <View
                style={[
                  styles.statTextColumn,
                  isRtl ? styles.alignRtl : styles.alignLtr,
                ]}
              >
                <Text style={styles.statLabel}>{t.statActiveHalaqahsLabel}</Text>
                <Text style={styles.statValue}>{t.statActiveHalaqahsVal}</Text>
              </View>
            </View>

            {/* Card 2: دقائق الاستماع */}
            <View style={[styles.statBox, isRtl && styles.rtlRow]}>
              <View style={styles.statIconWrapper}>
                <HeadphonesIcon size={21} color="#6B8E7C" />
              </View>
              <View
                style={[
                  styles.statTextColumn,
                  isRtl ? styles.alignRtl : styles.alignLtr,
                ]}
              >
                <Text style={styles.statLabel}>{t.statListeningMinutesLabel}</Text>
                <Text style={styles.statValue}>{t.statListeningMinutesVal}</Text>
              </View>
            </View>
          </View>

          {/* Row 2: الآيات المستمعة (Right) | أيام متتالية (Left) */}
          <View style={[styles.statsGridRow, isRtl && styles.rtlRow]}>
            {/* Card 3: الآيات المستمعة */}
            <View style={[styles.statBox, isRtl && styles.rtlRow]}>
              <View style={styles.statIconWrapper}>
                <QuranBookIcon size={20} color="#6B8E7C" />
              </View>
              <View
                style={[
                  styles.statTextColumn,
                  isRtl ? styles.alignRtl : styles.alignLtr,
                ]}
              >
                <Text style={styles.statLabel}>{t.statListenedVersesLabel}</Text>
                <Text style={styles.statValue}>{t.statListenedVersesVal}</Text>
              </View>
            </View>

            {/* Card 4: أيام متتالية */}
            <View style={[styles.statBox, isRtl && styles.rtlRow]}>
              <View style={styles.statIconWrapper}>
                <FlameStreakIcon size={21} color="#6B8E7C" />
              </View>
              <View
                style={[
                  styles.statTextColumn,
                  isRtl ? styles.alignRtl : styles.alignLtr,
                ]}
              >
                <Text style={styles.statLabel}>{t.statConsecutiveDaysLabel}</Text>
                <Text style={styles.statValue}>{t.statConsecutiveDaysVal}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: "تقدمك الحالي" (Current Progress) */}
        <View style={styles.progressSection}>
          <View
            style={[
              styles.sectionTitleHeader,
              { justifyContent: isRtl ? 'flex-end' : 'flex-start' },
            ]}
          >
            <Text
              style={[
                styles.sectionTitleMain,
                { fontFamily: FONTS.tajawal },
              ]}
            >
              {t.currentProgressTitle}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.progressCard}>
            {/* Percentage on Right in RTL */}
            <View
              style={[
                styles.progressPercentRow,
                { justifyContent: isRtl ? 'flex-end' : 'flex-start' },
              ]}
            >
              <Text style={styles.progressPercentText}>
                {t.currentProgressPercent}
              </Text>
            </View>

            {/* Golden Progress Bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFillGold, { width: '64%' }]} />
            </View>

            {/* Remaining Juz text with Seal Icon */}
            <View style={[styles.remainingJuzRow, isRtl && styles.rtlRow]}>
              <View style={styles.sealIconBox}>
                <SealCheckIcon size={18} color="#D4AF37" />
              </View>
              <Text style={styles.remainingJuzLabel}>{t.remainingJuzText}</Text>
            </View>
          </View>
        </View>

        {/* Section: "إعدادات الحساب" (Account Settings) */}
        <View style={styles.settingsSection}>
          <View
            style={[
              styles.settingsHeaderRow,
              { justifyContent: isRtl ? 'flex-end' : 'flex-start' },
            ]}
          >
            <Text style={styles.settingsHeaderTitle}>
              {t.accountSettingsSection}
            </Text>
          </View>

          {/* List of Menu Options matching the screenshot */}
          <View style={styles.menuItemsList}>
            {/* 1. بياناتي الشخصية */}
            <TouchableOpacity
              style={[styles.menuOptionRow, isRtl && styles.rtlRow]}
              onPress={() => setActiveModal('personalInfo')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuRowLeftGroup, isRtl && styles.rtlRow]}>
                <NavProfileIcon size={21} color="#8A9E96" />
                <Text style={styles.menuOptionLabel}>{t.menuPersonalInfo}</Text>
              </View>
              <View
                style={[styles.chevronArrowBox, isRtl && styles.chevronFlipped]}
              >
                <ChevronRightIcon size={16} color="#6B8E7C" />
              </View>
            </TouchableOpacity>

            {/* 2. قوائمي المفضلة */}
            <TouchableOpacity
              style={[styles.menuOptionRow, isRtl && styles.rtlRow]}
              onPress={() => setActiveModal('favPlaylists')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuRowLeftGroup, isRtl && styles.rtlRow]}>
                <BookmarkRibbonIcon size={20} color="#8A9E96" />
                <Text style={styles.menuOptionLabel}>
                  {t.menuFavoritePlaylists}
                </Text>
              </View>
              <View
                style={[styles.chevronArrowBox, isRtl && styles.chevronFlipped]}
              >
                <ChevronRightIcon size={16} color="#6B8E7C" />
              </View>
            </TouchableOpacity>

            {/* 3. الإشعارات والتذكيرات */}
            <TouchableOpacity
              style={[styles.menuOptionRow, isRtl && styles.rtlRow]}
              onPress={() => setActiveModal('notifications')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuRowLeftGroup, isRtl && styles.rtlRow]}>
                <NotificationBellIcon size={21} color="#8A9E96" />
                <Text style={styles.menuOptionLabel}>{t.menuNotifications}</Text>
              </View>
              <View
                style={[styles.chevronArrowBox, isRtl && styles.chevronFlipped]}
              >
                <ChevronRightIcon size={16} color="#6B8E7C" />
              </View>
            </TouchableOpacity>

            {/* 4. الإعدادات العامة واللغة */}
            <TouchableOpacity
              style={[styles.menuOptionRow, isRtl && styles.rtlRow]}
              onPress={() => setActiveModal('generalSettings')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuRowLeftGroup, isRtl && styles.rtlRow]}>
                <GlobeIcon size={20} color="#8A9E96" />
                <Text style={styles.menuOptionLabel}>
                  {t.menuGeneralSettings}
                </Text>
              </View>
              <View
                style={[styles.chevronArrowBox, isRtl && styles.chevronFlipped]}
              >
                <ChevronRightIcon size={16} color="#6B8E7C" />
              </View>
            </TouchableOpacity>

            {/* 5. تسجيل الخروج */}
            <TouchableOpacity
              style={[styles.menuOptionRow, isRtl && styles.rtlRow]}
              onPress={() => setActiveModal('signOutConfirm')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuRowLeftGroup, isRtl && styles.rtlRow]}>
                <SignOutIcon size={20} color="#E06D6D" />
                <Text style={[styles.menuOptionLabel, styles.signOutTextRed]}>
                  {t.menuSignOutItem}
                </Text>
              </View>
              <View
                style={[styles.chevronArrowBox, isRtl && styles.chevronFlipped]}
              >
                <ChevronRightIcon size={16} color="#E06D6D" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* ============ MODAL 1: بياناتي الشخصية (Personal Info) ============ */}
      {/* ======================================================== */}
      <Modal
        visible={activeModal === 'personalInfo'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandleBar} />

            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>{t.personalInfoTitle}</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Avatar Preview */}
              <View style={styles.modalAvatarBox}>
                <View style={styles.modalAvatarRing}>
                  <Image source={MUSLIM_AVATAR} style={styles.modalAvatarImg} />
                </View>
                <Text style={styles.modalAvatarHint}>
                  {lang === 'ar' ? 'صورة الحساب الشخصي' : 'Profile Picture'}
                </Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.fullNameLabel}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t.namePlaceholder}
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.emailAddressLabel}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textInputDisabled,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                  value={userEmail}
                  editable={false}
                />
              </View>

              {/* Wird Target Selector */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.dailyWirdTargetLabel}
                </Text>
                <View style={[styles.pillsRow, isRtl && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      wirdGoal === 'half' && styles.choicePillActive,
                    ]}
                    onPress={() => setWirdGoal('half')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        wirdGoal === 'half' && styles.choicePillTextActive,
                      ]}
                    >
                      {lang === 'ar' ? 'نصف جزء' : '½ Juz'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      wirdGoal === 'full' && styles.choicePillActive,
                    ]}
                    onPress={() => setWirdGoal('full')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        wirdGoal === 'full' && styles.choicePillTextActive,
                      ]}
                    >
                      {lang === 'ar' ? 'جزء كامل' : '1 Juz'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      wirdGoal === 'double' && styles.choicePillActive,
                    ]}
                    onPress={() => setWirdGoal('double')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        wirdGoal === 'double' && styles.choicePillTextActive,
                      ]}
                    >
                      {lang === 'ar' ? 'جزآن' : '2 Juz'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preferred Reciter */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.preferredReciterLabel}
                </Text>
                <View style={styles.recitersList}>
                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      preferredReciter === 'mishary' &&
                        styles.reciterItemActive,
                    ]}
                    onPress={() => setPreferredReciter('mishary')}
                  >
                    <Text style={styles.reciterItemText}>
                      {lang === 'ar'
                        ? 'مشاري راشد العفاسي'
                        : 'Mishary Rashid Alafasy'}
                    </Text>
                    {preferredReciter === 'mishary' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      preferredReciter === 'abdulbaset' &&
                        styles.reciterItemActive,
                    ]}
                    onPress={() => setPreferredReciter('abdulbaset')}
                  >
                    <Text style={styles.reciterItemText}>
                      {lang === 'ar'
                        ? 'عبد الباسط عبد الصمد'
                        : 'AbdulBaset AbdulSamad'}
                    </Text>
                    {preferredReciter === 'abdulbaset' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      preferredReciter === 'husary' &&
                        styles.reciterItemActive,
                    ]}
                    onPress={() => setPreferredReciter('husary')}
                  >
                    <Text style={styles.reciterItemText}>
                      {lang === 'ar'
                        ? 'محمود خليل الحصري'
                        : 'Mahmoud Khalil Al-Husary'}
                    </Text>
                    {preferredReciter === 'husary' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleSavePersonalInfo}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  {saveBannerVisible ? t.savedSuccess : t.saveChanges}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ============ MODAL 2: قوائمي المفضلة (Fav Playlists) ============ */}
      {/* ======================================================== */}
      <Modal
        visible={activeModal === 'favPlaylists'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandleBar} />

            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>{t.favPlaylistsTitle}</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text
                style={[
                  styles.modalSubHeader,
                  isRtl ? styles.alignRtlText : styles.alignLtrText,
                ]}
              >
                {t.favPlaylistsDesc}
              </Text>

              {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t.favPlaylistsEmpty}</Text>
                </View>
              ) : (
                favorites.map((item) => {
                  const isPlaying = playingFavId === item.id;
                  return (
                    <View
                      key={item.id}
                      style={[styles.favItemRow, isRtl && styles.rtlRow]}
                    >
                      {/* Play Button */}
                      <TouchableOpacity
                        style={[
                          styles.favPlayBtn,
                          isPlaying && styles.favPlayBtnActive,
                        ]}
                        onPress={() =>
                          setPlayingFavId(isPlaying ? null : item.id)
                        }
                      >
                        {isPlaying ? (
                          <PauseIcon size={14} color="#0A221C" />
                        ) : (
                          <PlayIcon size={14} color="#0A221C" />
                        )}
                      </TouchableOpacity>

                      {/* Content */}
                      <View
                        style={[
                          styles.favItemTextCol,
                          isRtl ? styles.alignRtl : styles.alignLtr,
                        ]}
                      >
                        <Text style={styles.favItemTitle}>
                          {lang === 'ar' ? item.titleAr : item.titleEn}
                        </Text>
                        <Text style={styles.favItemQari}>
                          {lang === 'ar' ? item.qariAr : item.qariEn} •{' '}
                          {item.duration}
                        </Text>
                      </View>

                      {/* Delete / Remove Action */}
                      <TouchableOpacity
                        style={styles.removeFavBtn}
                        onPress={() => handleRemoveFavorite(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <TrashIcon size={17} color="#8A9E96" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setActiveModal('none')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionButtonText}>{t.close}</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ============ MODAL 3: الإشعارات والتذكيرات (Notifications) ============ */}
      {/* ======================================================== */}
      <Modal
        visible={activeModal === 'notifications'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandleBar} />

            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>{t.notificationsTitle}</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text
                style={[
                  styles.modalSubHeader,
                  isRtl ? styles.alignRtlText : styles.alignLtrText,
                ]}
              >
                {t.notificationsDesc}
              </Text>

              {/* Toggle 1: Daily Wird */}
              <View style={[styles.switchOptionCard, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.switchTextCol,
                    isRtl ? styles.alignRtl : styles.alignLtr,
                  ]}
                >
                  <Text style={styles.switchTitleText}>{t.notifDailyWird}</Text>
                  <Text style={styles.switchSubText}>
                    {t.notifDailyWirdTime}
                  </Text>
                </View>
                <Switch
                  value={notifDailyWird}
                  onValueChange={setNotifDailyWird}
                  trackColor={{ false: '#163E33', true: '#D4AF37' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Toggle 2: Friday Al-Kahf */}
              <View style={[styles.switchOptionCard, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.switchTextCol,
                    isRtl ? styles.alignRtl : styles.alignLtr,
                  ]}
                >
                  <Text style={styles.switchTitleText}>
                    {t.notifKahfFriday}
                  </Text>
                  <Text style={styles.switchSubText}>
                    {t.notifKahfFridayDesc}
                  </Text>
                </View>
                <Switch
                  value={notifKahfFriday}
                  onValueChange={setNotifKahfFriday}
                  trackColor={{ false: '#163E33', true: '#D4AF37' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Toggle 3: Live Halaqahs */}
              <View style={[styles.switchOptionCard, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.switchTextCol,
                    isRtl ? styles.alignRtl : styles.alignLtr,
                  ]}
                >
                  <Text style={styles.switchTitleText}>
                    {t.notifHalaqahAlerts}
                  </Text>
                  <Text style={styles.switchSubText}>
                    {t.notifHalaqahAlertsDesc}
                  </Text>
                </View>
                <Switch
                  value={notifHalaqahs}
                  onValueChange={setNotifHalaqahs}
                  trackColor={{ false: '#163E33', true: '#D4AF37' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Toggle 4: Adhkar Reminders */}
              <View style={[styles.switchOptionCard, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.switchTextCol,
                    isRtl ? styles.alignRtl : styles.alignLtr,
                  ]}
                >
                  <Text style={styles.switchTitleText}>
                    {t.notifAdhkarReminders}
                  </Text>
                  <Text style={styles.switchSubText}>
                    {t.notifAdhkarRemindersDesc}
                  </Text>
                </View>
                <Switch
                  value={notifAdhkar}
                  onValueChange={setNotifAdhkar}
                  trackColor={{ false: '#163E33', true: '#D4AF37' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Save / Close */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setActiveModal('none')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>{t.close}</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ============ MODAL 4: الإعدادات العامة واللغة (General Settings) ============ */}
      {/* ======================================================== */}
      <Modal
        visible={activeModal === 'generalSettings'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandleBar} />

            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>
                {t.generalSettingsTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Language Switch Section */}
              <View style={styles.settingBlockContainer}>
                <Text
                  style={[
                    styles.settingBlockTitle,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.appLanguageLabel}
                </Text>

                <View style={[styles.pillsRow, isRtl && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      lang === 'ar' && styles.choicePillActive,
                    ]}
                    onPress={() => {
                      if (lang !== 'ar') onToggleLang();
                    }}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        lang === 'ar' && styles.choicePillTextActive,
                      ]}
                    >
                      العربية (Arabic)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      lang === 'en' && styles.choicePillActive,
                    ]}
                    onPress={() => {
                      if (lang !== 'en') onToggleLang();
                    }}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        lang === 'en' && styles.choicePillTextActive,
                      ]}
                    >
                      English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Audio Streaming Quality */}
              <View style={styles.settingBlockContainer}>
                <Text
                  style={[
                    styles.settingBlockTitle,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.audioQualityLabel}
                </Text>

                <View style={styles.recitersList}>
                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      audioQuality === '320' && styles.reciterItemActive,
                    ]}
                    onPress={() => setAudioQuality('320')}
                  >
                    <Text style={styles.reciterItemText}>{t.qualityHigh}</Text>
                    {audioQuality === '320' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      audioQuality === '128' && styles.reciterItemActive,
                    ]}
                    onPress={() => setAudioQuality('128')}
                  >
                    <Text style={styles.reciterItemText}>{t.qualityMedium}</Text>
                    {audioQuality === '128' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reciterItem,
                      isRtl && styles.rtlRow,
                      audioQuality === '64' && styles.reciterItemActive,
                    ]}
                    onPress={() => setAudioQuality('64')}
                  >
                    <Text style={styles.reciterItemText}>{t.qualityLow}</Text>
                    {audioQuality === '64' && (
                      <CheckSmallIcon size={18} color="#D4AF37" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Auto-Play Next Surah */}
              <View style={[styles.switchOptionCard, isRtl && styles.rtlRow]}>
                <View
                  style={[
                    styles.switchTextCol,
                    isRtl ? styles.alignRtl : styles.alignLtr,
                  ]}
                >
                  <Text style={styles.switchTitleText}>
                    {t.autoPlayNextLabel}
                  </Text>
                  <Text style={styles.switchSubText}>
                    {t.autoPlayNextDesc}
                  </Text>
                </View>
                <Switch
                  value={autoPlayNext}
                  onValueChange={setAutoPlayNext}
                  trackColor={{ false: '#163E33', true: '#D4AF37' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Quran Script Style */}
              <View style={styles.settingBlockContainer}>
                <Text
                  style={[
                    styles.settingBlockTitle,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {t.quranScriptLabel}
                </Text>

                <View style={[styles.pillsRow, isRtl && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      quranScript === 'hafs' && styles.choicePillActive,
                    ]}
                    onPress={() => setQuranScript('hafs')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        quranScript === 'hafs' && styles.choicePillTextActive,
                      ]}
                    >
                      {t.quranScriptHafs}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.choicePill,
                      quranScript === 'warsh' && styles.choicePillActive,
                    ]}
                    onPress={() => setQuranScript('warsh')}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        quranScript === 'warsh' && styles.choicePillTextActive,
                      ]}
                    >
                      {t.quranScriptWarsh}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setActiveModal('none')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>{t.close}</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ============ MODAL 5: تأكيد تسجيل الخروج (Sign Out) ============ */}
      {/* ======================================================== */}
      <Modal
        visible={activeModal === 'signOutConfirm'}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <TouchableOpacity
            style={styles.confirmDialogCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.confirmIconCircle}>
              <SignOutIcon size={26} color="#F87171" />
            </View>

            <Text style={styles.confirmTitleText}>{t.confirmSignOutTitle}</Text>
            <Text style={styles.confirmMessageText}>
              {t.confirmSignOutDesc}
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setActiveModal('none')}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDangerBtn}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDangerBtnText}>
                  {t.confirmSignOutBtn}
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#0A221C', // Solid deep emerald green matching screenshot
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },

  /* Top Header Bar */
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    height: 40,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 14.5,
    color: '#8A9E96',
    fontWeight: '500',
  },

  /* Avatar Section */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: '#D4AF37', // Radiant Gold ring matching screenshot
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#F4EFE6',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginBottom: 4,
    textAlign: 'center',
  },
  memberSinceText: {
    fontSize: 12.5,
    color: '#6B8E7C',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  /* 2x2 Stats Grid */
  statsGrid: {
    gap: 12,
    marginBottom: 26,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#133A30',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextColumn: {
    flex: 1,
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
  statLabel: {
    fontSize: 12,
    color: '#8A9E96',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Section: Current Progress (تقدمك الحالي) */
  progressSection: {
    marginBottom: 26,
  },
  sectionTitleHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sectionTitleMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  progressCard: {
    backgroundColor: '#133A30',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  progressPercentRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressPercentText: {
    fontSize: 13.5,
    color: '#8A9E96',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#091F19',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFillGold: {
    height: '100%',
    backgroundColor: '#D4AF37', // Warm Radiant Gold fill
    borderRadius: 4,
  },
  remainingJuzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sealIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingJuzLabel: {
    fontSize: 13,
    color: '#D4E2DC',
    fontWeight: '500',
  },

  /* Section: Account Settings (إعدادات الحساب) */
  settingsSection: {
    marginBottom: 20,
  },
  settingsHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  settingsHeaderTitle: {
    fontSize: 13.5,
    color: '#6B8E7C',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  menuItemsList: {
    gap: 2,
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  menuRowLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuOptionLabel: {
    fontSize: 15.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signOutTextRed: {
    color: '#E06D6D',
  },
  chevronArrowBox: {
    paddingHorizontal: 4,
  },
  chevronFlipped: {
    transform: [{ rotate: '180deg' }],
  },

  /* Modal Sheets Styling */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitleText: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalSubHeader: {
    fontSize: 13,
    color: '#8A9E96',
    marginBottom: 18,
    lineHeight: 19,
  },

  /* Modal Avatar Edit Preview */
  modalAvatarBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modalAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#F4EFE6',
  },
  modalAvatarHint: {
    fontSize: 12,
    color: '#8A9E96',
  },

  /* Form Inputs */
  inputGroup: {
    marginBottom: 16,
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
    fontSize: 14.5,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  textInputDisabled: {
    color: '#6B8E7C',
    backgroundColor: 'rgba(10, 34, 28, 0.6)',
  },

  /* Pill Selectors */
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
    fontSize: 12.5,
    color: '#8A9E96',
    fontWeight: '600',
  },
  choicePillTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },

  /* Reciters List & Audio Quality List */
  recitersList: {
    gap: 8,
  },
  reciterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A221C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reciterItemActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#163E32',
  },
  reciterItemText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* Switch Option Card */
  switchOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A221C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  switchSubText: {
    fontSize: 11.5,
    color: '#8A9E96',
  },

  /* Setting Block */
  settingBlockContainer: {
    marginBottom: 18,
  },
  settingBlockTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#D4E2DC',
    marginBottom: 8,
  },

  /* Favorites List Items */
  favItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A221C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  favPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favPlayBtnActive: {
    backgroundColor: '#F0CE63',
  },
  favPlayIconChar: {
    fontSize: 12,
    color: '#0A221C',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  favItemTextCol: {
    flex: 1,
  },
  favItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  favItemQari: {
    fontSize: 12,
    color: '#8A9E96',
  },
  removeFavBtn: {
    padding: 6,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    color: '#8A9E96',
  },

  /* Action Buttons */
  primaryActionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A221C',
    letterSpacing: 0.2,
  },
  secondaryActionButton: {
    backgroundColor: '#163E32',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },

  /* Confirmation Dialog */
  confirmDialogCard: {
    backgroundColor: '#133A30',
    borderRadius: 22,
    marginHorizontal: 28,
    marginBottom: 'auto',
    marginTop: 'auto',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 20,
  },
  confirmIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitleText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessageText: {
    fontSize: 13.5,
    color: '#8A9E96',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#163E32',
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
  confirmDangerBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDangerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
