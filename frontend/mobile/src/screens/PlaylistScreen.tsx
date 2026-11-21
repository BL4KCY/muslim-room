import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { MobileUser } from './AuthScreen';
import { MobileLanguage, MOBILE_TRANSLATIONS } from '../i18n/translations';
import {
  FolderIcon,
  PodcastIcon,
  QuranBookIcon,
  StarFavoriteIcon,
  FlameStreakIcon,
  HeadphonesIcon,
  SearchIcon,
  CloseIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  ShuffleIcon,
  SkipNextIcon,
  SkipPrevIcon,
  HeartFilledIcon,
  CheckSmallIcon,
  TrashIcon,
  ThreeDotsIcon,
  ClockIcon,
  ChevronRightIcon,
  LockIcon,
  KeyIcon,
  GlobeIcon,
  ShareIcon,
  EditPencilIcon,
} from '../components/HomeIcons';
import {
  ALL_QURAN_SURAHS,
  FAMOUS_RECITERS,
} from '../data/quranCatalog';
import {
  INITIAL_PLAYLISTS,
  PlaylistFolder,
  PlaylistTrackItem,
} from '../data/playlistData';

interface SwipeablePlaylistItemProps {
  playlist: PlaylistFolder;
  isRtl: boolean;
  lang: MobileLanguage;
  isPlayingThis: boolean;
  onPress: () => void;
  onQuickPlay: () => void;
  onDeleteRequest: (playlist: PlaylistFolder) => void;
  onEditRequest: (playlist: PlaylistFolder) => void;
  isOwner: boolean;
}

const SwipeablePlaylistItem: React.FC<SwipeablePlaylistItemProps> = ({
  playlist,
  isRtl,
  lang,
  isPlayingThis,
  onPress,
  onQuickPlay,
  onDeleteRequest,
  onEditRequest,
  isOwner,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef<'none' | 'delete' | 'edit'>('none');
  const [swipeStatus, setSwipeStatus] = useState<'none' | 'delete' | 'edit'>('none');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;
        if (dx > 110) dx = 110 + (dx - 110) * 0.2;
        if (dx < -110) dx = -110 + (dx + 110) * 0.2;
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Flicking right (dx > 50 or vx > 0.4): reveals Red Bin (Delete action)
        if (gestureState.dx > 50 || gestureState.vx > 0.4) {
          isOpen.current = 'delete';
          setSwipeStatus('delete');
          Animated.spring(translateX, {
            toValue: 90,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
        // Flicking left (dx < -50 or vx < -0.4): reveals Edit action
        else if (gestureState.dx < -50 || gestureState.vx < -0.4) {
          isOpen.current = 'edit';
          setSwipeStatus('edit');
          Animated.spring(translateX, {
            toValue: -90,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
        // Return to center
        else {
          isOpen.current = 'none';
          setSwipeStatus('none');
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    isOpen.current = 'none';
    setSwipeStatus('none');
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const handleCardPress = () => {
    if (isOpen.current !== 'none') {
      handleClose();
      return;
    }
    onPress();
  };

  // Smooth opacity interpolation so the revealed background matches gesture direction
  // and stays completely hidden when card is resting or slightly pressed
  const deleteOpacity = translateX.interpolate({
    inputRange: [0, 18, 55],
    outputRange: [0, 0.35, 1],
    extrapolate: 'clamp',
  });

  const editOpacity = translateX.interpolate({
    inputRange: [-55, -18, 0],
    outputRange: [1, 0.35, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipeableContainer}>
      {/* 1. Underlying Delete Action (Positioned strictly UNDER the card on the left) */}
      <Animated.View
        style={[
          styles.swipeActionDeleteFull,
          { opacity: deleteOpacity },
          !isOwner && { backgroundColor: '#1E293B' },
        ]}
      >
        <TouchableOpacity
          style={styles.swipeActionContentLeft}
          onPress={() => {
            handleClose();
            onDeleteRequest(playlist);
          }}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.swipeIconCircle,
              !isOwner && { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            ]}
          >
            {isOwner ? (
              <TrashIcon size={20} color="#FFFFFF" />
            ) : (
              <LockIcon size={18} color="#94A3B8" />
            )}
          </View>
          <Text
            style={[
              styles.swipeActionDeleteText,
              !isOwner && { color: '#94A3B8', fontSize: 10.5 },
            ]}
          >
            {isOwner
              ? (lang === 'ar' ? 'حذف' : 'Delete')
              : (lang === 'ar' ? 'المشرف فقط' : 'Admin Only')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 2. Underlying Edit Action (Positioned strictly UNDER the card on the right) */}
      <Animated.View
        style={[
          styles.swipeActionEditFull,
          { opacity: editOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.swipeActionContentRight}
          onPress={() => {
            handleClose();
            onEditRequest(playlist);
          }}
          activeOpacity={0.75}
        >
          <View style={styles.swipeEditIconCircle}>
            <EditPencilIcon size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.swipeActionEditText}>
            {lang === 'ar' ? 'تعديل' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Foreground Sliding Card (ON TOP) */}
      <Animated.View
        style={[
          styles.swipeableCardFront,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.playlistCard,
            isRtl && styles.rtlRow,
            isPlayingThis && styles.playlistCardPlaying,
          ]}
          onPress={handleCardPress}
          activeOpacity={0.92}
        >
          {/* Icon Circle */}
          <View
            style={[
              styles.playlistIconCircle,
              playlist.kind === 'podcast' && styles.podcastIconCircle,
              playlist.kind === 'masterpiece' && styles.masterpieceIconCircle,
            ]}
          >
            {playlist.kind === 'podcast' ? (
              <PodcastIcon size={22} color="#D4AF37" />
            ) : playlist.kind === 'masterpiece' ? (
              <StarFavoriteIcon size={22} color="#D4AF37" />
            ) : playlist.kind === 'khatmah' ? (
              <FlameStreakIcon size={22} color="#D4AF37" />
            ) : (
              <FolderIcon size={22} color="#D4AF37" />
            )}
          </View>

          {/* Details Column */}
          <View
            style={[
              styles.playlistDetailsCol,
              isRtl ? styles.alignRtl : styles.alignLtr,
            ]}
          >
            <View style={[styles.playlistBadgeRow, isRtl && styles.rtlRow]}>
              <View style={styles.playlistBadgePill}>
                <Text style={styles.playlistBadgeText}>
                  {lang === 'ar' ? playlist.badgeAr : playlist.badgeEn}
                </Text>
              </View>

              {playlist.visibility === 'private' ? (
                <View style={styles.cardLockPill}>
                  <LockIcon size={11} color="#D4AF37" />
                  <Text style={styles.cardLockText}>
                    {lang === 'ar' ? 'خاصة' : 'Private'}
                  </Text>
                </View>
              ) : (
                <View style={styles.cardPublicPill}>
                  <GlobeIcon size={11} color="#2DD4BF" />
                  <Text style={styles.cardPublicText}>
                    {lang === 'ar' ? 'عامة' : 'Public'}
                  </Text>
                </View>
              )}

              {playlist.editPermission === 'members_can_edit' && (
                <View style={styles.cardCollabPill}>
                  <Text style={styles.cardCollabText}>
                    {lang === 'ar' ? 'تعاوني' : 'Collab'}
                  </Text>
                </View>
              )}

              {playlist.isFavorite && (
                <HeartFilledIcon size={12} color="#E06D6D" />
              )}
            </View>

            <Text
              style={[
                styles.playlistCardTitle,
                { fontFamily: FONTS.tajawal },
              ]}
              numberOfLines={1}
            >
              {lang === 'ar' ? playlist.titleAr : playlist.titleEn}
            </Text>

            <Text style={styles.playlistCardSubtitle} numberOfLines={1}>
              {lang === 'ar' ? playlist.subtitleAr : playlist.subtitleEn}
            </Text>

            <Text style={styles.playlistMetaSmall}>
              {playlist.tracks.length} {lang === 'ar' ? 'عناصر' : 'tracks'} •{' '}
              {playlist.totalDuration}
            </Text>
          </View>

          {/* Quick Play Button */}
          <TouchableOpacity
            style={[
              styles.playlistPlayMiniBtn,
              isPlayingThis && styles.playlistPlayMiniBtnActive,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onQuickPlay();
            }}
            activeOpacity={0.8}
          >
            {isPlayingThis ? (
              <PauseIcon size={14} color="#0A221C" />
            ) : (
              <PlayIcon size={14} color="#D4AF37" />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

interface PlaylistScreenProps {
  lang: MobileLanguage;
  onToggleLang: () => void;
  user: MobileUser;
  onBackToHome: () => void;
  initialSelectedPlaylistId?: string;
}

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  lang,
  onToggleLang,
  user,
  onBackToHome,
  initialSelectedPlaylistId,
}) => {
  const t = MOBILE_TRANSLATIONS[lang];
  const isRtl = t.isRtl;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'wird' | 'podcast' | 'masterpieces' | 'khatmah' | 'favorites'
  >('all');

  const [playlistsList, setRoomsList] = useState<PlaylistFolder[]>(INITIAL_PLAYLISTS);

  // Active opened playlist details modal:
  const [activePlaylist, setActivePlaylist] = useState<PlaylistFolder | null>(() => {
    if (initialSelectedPlaylistId) {
      return (
        INITIAL_PLAYLISTS.find((p) => p.id === initialSelectedPlaylistId) ||
        null
      );
    }
    return null;
  });

  // Current playing audio state (Mini-Player):
  const [playingTrack, setPlayingTrack] = useState<PlaylistTrackItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  // Add Track Modal State:
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [addSurahNumber, setAddSurahNumber] = useState<number>(18);
  const [addReciterId, setAddReciterId] = useState<string>('mishary');
  const [addAyahRange, setAddAyahRange] = useState('آية ١ – ١٠');
  const [addModalTab, setAddModalTab] = useState<'surah' | 'reciter'>('surah');
  const [addSurahSearch, setAddSurahSearch] = useState('');
  const [addReciterSearch, setAddReciterSearch] = useState('');

  // Create Playlist Modal State (Simplified: name, description (optional), public or private, and edit restriction):
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVisibility, setNewVisibility] = useState<'public' | 'private'>('public');
  const [newEditPermission, setNewEditPermission] = useState<'admin_only' | 'members_can_edit'>('admin_only');

  // Private Playlist Unlock Modal State:
  const [unlockedPrivateIds, setUnlockedPrivateIds] = useState<string[]>(['pl-tahajjud-khatmah']);
  const [pendingPrivatePlaylist, setPendingPrivatePlaylist] = useState<PlaylistFolder | null>(null);
  const [isPrivateUnlockModalOpen, setIsPrivateUnlockModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState('');

  // In-app toast message (e.g. for copying invite code or permission changes):
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Edit Playlist Modal State (Admin can change name, description, and members edit permission):
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistFolder | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public');
  const [editPermission, setEditPermission] = useState<'admin_only' | 'members_can_edit'>('admin_only');

  // Delete Playlist Confirmation State (Triggered by flicking right):
  const [deletingPlaylist, setDeletingPlaylist] = useState<PlaylistFolder | null>(null);

  // Open Edit Playlist Modal:
  const handleOpenEditModal = (playlist: PlaylistFolder) => {
    const isOwner =
      playlist.ownerId === 'user-me' ||
      playlist.ownerAr === user.displayName ||
      playlist.ownerAr.includes('أنت');

    if (!isOwner) {
      showToast(
        lang === 'ar'
          ? `فقط مشرف القائمة (${playlist.ownerAr}) يملك صلاحية تعديلها`
          : `Only the admin (${playlist.ownerEn}) can edit this playlist`
      );
      return;
    }

    setEditingPlaylist(playlist);
    setEditTitle(lang === 'ar' ? playlist.titleAr : playlist.titleEn);
    setEditDesc(lang === 'ar' ? playlist.subtitleAr : playlist.subtitleEn);
    setEditVisibility(playlist.visibility);
    setEditPermission(playlist.editPermission);
  };

  // Save Playlist Edits:
  const handleSavePlaylistEdits = () => {
    if (!editingPlaylist) return;
    const titleClean = editTitle.trim();
    if (!titleClean) return;

    const updated: PlaylistFolder = {
      ...editingPlaylist,
      titleAr: titleClean,
      titleEn: titleClean,
      subtitleAr: editDesc.trim(),
      subtitleEn: editDesc.trim(),
      visibility: editVisibility,
      editPermission: editPermission,
      badgeAr: editVisibility === 'public' ? 'قائمة عامة' : 'قائمة خاصة برمز',
      badgeEn: editVisibility === 'public' ? 'Public Playlist' : 'Private (Code)',
    };

    setRoomsList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    if (activePlaylist?.id === updated.id) {
      setActivePlaylist(updated);
    }

    setEditingPlaylist(null);
    showToast(
      lang === 'ar'
        ? 'تم حفظ وتحديث بيانات القائمة وصلاحياتها بنجاح!'
        : 'Playlist settings updated successfully!'
    );
  };

  // Request to Delete Playlist (triggered by flicking to the right):
  const handleDeletePlaylistRequest = (playlist: PlaylistFolder) => {
    const isOwner =
      playlist.ownerId === 'user-me' ||
      playlist.ownerId === user.id ||
      playlist.ownerAr === user.displayName ||
      playlist.ownerAr.includes('أنت') ||
      playlist.ownerEn.includes('You');

    if (!isOwner) {
      showToast(
        lang === 'ar'
          ? `لا يمكن حذف القائمة إلا من قِبل مشرفها (${playlist.ownerAr})`
          : `Only the playlist admin (${playlist.ownerEn}) can delete it`
      );
      return;
    }

    setDeletingPlaylist(playlist);
  };

  // Confirm Delete Playlist:
  const handleConfirmDeletePlaylist = () => {
    if (!deletingPlaylist) return;
    const targetId = deletingPlaylist.id;

    setRoomsList((prev) => prev.filter((p) => p.id !== targetId));

    if (activePlaylist?.id === targetId) {
      setActivePlaylist(null);
    }
    if (playingTrack && deletingPlaylist.tracks.some((t) => t.id === playingTrack.id)) {
      setPlayingTrack(null);
      setIsPlaying(false);
    }

    const name = lang === 'ar' ? deletingPlaylist.titleAr : deletingPlaylist.titleEn;
    setDeletingPlaylist(null);
    showToast(
      lang === 'ar'
        ? `تم حذف قائمة «${name}» بنجاح`
        : `Playlist «${name}» deleted successfully`
    );
  };

  // Filtering Playlists:
  const filteredPlaylists = playlistsList.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? p.isFavorite
        : p.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      p.titleAr.toLowerCase().includes(query) ||
      p.titleEn.toLowerCase().includes(query) ||
      p.subtitleAr.toLowerCase().includes(query) ||
      p.subtitleEn.toLowerCase().includes(query) ||
      p.tracks.some(
        (tr) =>
          tr.surahAr.toLowerCase().includes(query) ||
          tr.surahEn.toLowerCase().includes(query) ||
          tr.qariAr.toLowerCase().includes(query) ||
          tr.qariEn.toLowerCase().includes(query)
      );

    return matchesCategory && matchesSearch;
  });

  // Toggle favorite on playlist:
  const handleToggleFavoritePlaylist = (id: string) => {
    setRoomsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (activePlaylist && activePlaylist.id === id) {
      setActivePlaylist((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  // Play a specific track:
  const handlePlayTrack = (track: PlaylistTrackItem) => {
    if (playingTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingTrack(track);
      setIsPlaying(true);
    }
  };

  // Play entire playlist:
  const handlePlayAll = (playlist: PlaylistFolder) => {
    if (playlist.tracks.length > 0) {
      const firstTrack = isShuffleOn
        ? playlist.tracks[Math.floor(Math.random() * playlist.tracks.length)]
        : playlist.tracks[0];
      setPlayingTrack(firstTrack);
      setIsPlaying(true);
    }
  };

  // Skip next:
  const handleSkipNext = () => {
    if (!activePlaylist || !playingTrack) return;
    const currentIndex = activePlaylist.tracks.findIndex(
      (tr) => tr.id === playingTrack.id
    );
    if (currentIndex >= 0 && currentIndex < activePlaylist.tracks.length - 1) {
      setPlayingTrack(activePlaylist.tracks[currentIndex + 1]);
      setIsPlaying(true);
    } else if (activePlaylist.tracks.length > 0) {
      setPlayingTrack(activePlaylist.tracks[0]);
      setIsPlaying(true);
    }
  };

  // Skip previous:
  const handleSkipPrev = () => {
    if (!activePlaylist || !playingTrack) return;
    const currentIndex = activePlaylist.tracks.findIndex(
      (tr) => tr.id === playingTrack.id
    );
    if (currentIndex > 0) {
      setPlayingTrack(activePlaylist.tracks[currentIndex - 1]);
      setIsPlaying(true);
    }
  };

  // Add track to active playlist:
  const handleAddTrackSubmit = () => {
    if (!activePlaylist) return;

    const surahObj =
      ALL_QURAN_SURAHS.find((s) => s.number === addSurahNumber) ||
      ALL_QURAN_SURAHS[17];
    const reciterObj =
      FAMOUS_RECITERS.find((r) => r.id === addReciterId) ||
      FAMOUS_RECITERS[0];

    const newTrack: PlaylistTrackItem = {
      id: `trk-p-${Date.now()}`,
      surahNumber: surahObj.number,
      surahAr: `سورة ${surahObj.nameAr}`,
      surahEn: `Surah ${surahObj.nameEn}`,
      qariAr: reciterObj.nameAr,
      qariEn: reciterObj.nameEn,
      ayahRange: addAyahRange || (lang === 'ar' ? 'كامل السورة' : 'Full Surah'),
      duration: '04:30',
      isFavorite: false,
    };

    const updatedTracks = [...activePlaylist.tracks, newTrack];
    const updatedPlaylist: PlaylistFolder = {
      ...activePlaylist,
      tracks: updatedTracks,
    };

    setActivePlaylist(updatedPlaylist);
    setRoomsList((prev) =>
      prev.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p))
    );
    setIsAddTrackModalOpen(false);
  };

  // Delete track from active playlist:
  const handleDeleteTrack = (trackId: string) => {
    if (!activePlaylist) return;
    const updatedTracks = activePlaylist.tracks.filter((t) => t.id !== trackId);
    const updatedPlaylist: PlaylistFolder = {
      ...activePlaylist,
      tracks: updatedTracks,
    };
    setActivePlaylist(updatedPlaylist);
    setRoomsList((prev) =>
      prev.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p))
    );
    if (playingTrack?.id === trackId) {
      setPlayingTrack(null);
      setIsPlaying(false);
    }
  };

  // Create new custom playlist (Normal Playlist Algorithm: name, description (optional), public or private, edit restriction):
  const handleCreatePlaylistSubmit = () => {
    const title = newTitle.trim();
    if (!title) return;

    // Auto-generate invite code for private playlists (e.g., PL-4819):
    const autoCode = `PL-${Math.floor(1000 + Math.random() * 9000)}`;

    const created: PlaylistFolder = {
      id: `pl-${Date.now()}`,
      kind: 'folder',
      category: 'all',
      titleAr: title,
      titleEn: title,
      subtitleAr:
        newDesc.trim() ||
        (lang === 'ar'
          ? `قائمة استماع أنشأها ${user.displayName || 'المشرف'}`
          : `Playlist created by ${user.displayName || 'Admin'}`),
      subtitleEn:
        newDesc.trim() ||
        `Playlist created by ${user.displayName || 'Admin'}`,
      badgeAr: newVisibility === 'public' ? 'قائمة عامة' : 'قائمة خاصة برمز',
      badgeEn: newVisibility === 'public' ? 'Public Playlist' : 'Private (Code)',
      totalDuration: '٠ دقيقة',
      ownerAr: user.displayName ? `${user.displayName} (أنت)` : 'زياد (أنت)',
      ownerEn: user.displayName ? `${user.displayName} (You)` : 'Ziad (You)',
      ownerId: 'user-me',
      visibility: newVisibility,
      inviteCode: newVisibility === 'private' ? autoCode : undefined,
      editPermission: newEditPermission,
      isFavorite: false,
      tracks: [], // Starts empty, the admin can add Surat right after creating!
    };

    setRoomsList([created, ...playlistsList]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewVisibility('public');
    setNewEditPermission('admin_only');

    // Immediately open the newly created playlist so the admin can add Surat
    setActivePlaylist(created);
    showToast(
      lang === 'ar'
        ? 'تم إنشاء القائمة بنجاح! يمكنك الآن إضافة السور.'
        : 'Playlist created! You can now add Surahs.'
    );
  };

  // Safe playlist open (handles Public access & Private invite code check):
  const handleSelectPlaylist = (playlist: PlaylistFolder) => {
    const isOwner =
      playlist.ownerId === 'user-me' ||
      playlist.ownerAr === user.displayName ||
      playlist.ownerAr.includes('أنت');

    // If private and user is not owner and hasn't unlocked yet:
    if (
      playlist.visibility === 'private' &&
      !isOwner &&
      !unlockedPrivateIds.includes(playlist.id)
    ) {
      setPendingPrivatePlaylist(playlist);
      setInviteCodeInput('');
      setInviteCodeError('');
      setIsPrivateUnlockModalOpen(true);
      return;
    }

    setActivePlaylist(playlist);
  };

  // Quick play button with private access check:
  const handleQuickPlayAll = (playlist: PlaylistFolder) => {
    const isOwner =
      playlist.ownerId === 'user-me' ||
      playlist.ownerAr === user.displayName ||
      playlist.ownerAr.includes('أنت');

    if (
      playlist.visibility === 'private' &&
      !isOwner &&
      !unlockedPrivateIds.includes(playlist.id)
    ) {
      setPendingPrivatePlaylist(playlist);
      setInviteCodeInput('');
      setInviteCodeError('');
      setIsPrivateUnlockModalOpen(true);
      return;
    }

    handlePlayAll(playlist);
  };

  // Unlock private playlist with invite code:
  const handleUnlockPrivateSubmit = () => {
    if (!pendingPrivatePlaylist) return;
    const cleanInput = inviteCodeInput.trim().toUpperCase();
    const correctCode = (pendingPrivatePlaylist.inviteCode || '').trim().toUpperCase();

    if (cleanInput === correctCode) {
      setUnlockedPrivateIds((prev) => [...prev, pendingPrivatePlaylist.id]);
      setActivePlaylist(pendingPrivatePlaylist);
      setIsPrivateUnlockModalOpen(false);
      setPendingPrivatePlaylist(null);
      setInviteCodeInput('');
      setInviteCodeError('');
      showToast(
        lang === 'ar'
          ? 'تم فتح القائمة الخاصة بنجاح!'
          : 'Private playlist unlocked successfully!'
      );
    } else {
      setInviteCodeError(
        lang === 'ar'
          ? 'رمز الدعوة غير صحيح. يرجى الحصول على الرمز الصحيح من مشرف القائمة.'
          : 'Invalid invite code. Please get the correct code from the playlist admin.'
      );
    }
  };

  // Admin toggling edit permission (admin_only vs members_can_edit):
  const handleToggleEditPermission = () => {
    if (!activePlaylist) return;
    const isOwner =
      activePlaylist.ownerId === 'user-me' ||
      activePlaylist.ownerAr === user.displayName ||
      activePlaylist.ownerAr.includes('أنت');
    if (!isOwner) return;

    const nextPerm =
      activePlaylist.editPermission === 'admin_only'
        ? 'members_can_edit'
        : 'admin_only';

    const updated: PlaylistFolder = {
      ...activePlaylist,
      editPermission: nextPerm,
    };

    setActivePlaylist(updated);
    setRoomsList((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showToast(
      lang === 'ar'
        ? nextPerm === 'members_can_edit'
          ? 'تم تفعيل التعديل التعاوني: يمكن للأعضاء الآن إضافة وحذف السور'
          : 'تم تقييد التعديل: أصبح التعديل مقتصراً على المشرف فقط'
        : nextPerm === 'members_can_edit'
        ? 'Collaborative editing enabled: members can now add and remove recitations'
        : 'Editing restricted: only admin can modify this playlist'
    );
  };

  // Filtered catalog lists for Add Track Modal:
  const addFilteredSurahs = ALL_QURAN_SURAHS.filter((s) => {
    if (!addSurahSearch.trim()) return true;
    const q = addSurahSearch.trim().toLowerCase();
    return (
      s.number.toString() === q ||
      s.nameAr.includes(q) ||
      s.nameEn.toLowerCase().includes(q)
    );
  });

  const addFilteredReciters = FAMOUS_RECITERS.filter((r) => {
    if (!addReciterSearch.trim()) return true;
    const q = addReciterSearch.trim().toLowerCase();
    return (
      r.nameAr.includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.styleAr.includes(q) ||
      r.styleEn.toLowerCase().includes(q)
    );
  });

  const addSelectedSurahObj =
    ALL_QURAN_SURAHS.find((s) => s.number === addSurahNumber) ||
    ALL_QURAN_SURAHS[17];
  const addSelectedReciterObj =
    FAMOUS_RECITERS.find((r) => r.id === addReciterId) ||
    FAMOUS_RECITERS[0];

  const featuredPlaylist = playlistsList[0];

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
                isRtl ? styles.alignRtlText : styles.alignLtrText,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {lang === 'ar'
                ? 'المجلدات وقوائم الاستماع'
                : 'Playlists & Folders'}
            </Text>
          </View>

          {/* Create New Playlist Button */}
          <TouchableOpacity
            style={[styles.createPlaylistBtn, isRtl && styles.rtlRow]}
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.85}
          >
            <PlusIcon size={16} color="#0A221C" />
            <Text style={styles.createPlaylistBtnText}>
              {lang === 'ar' ? 'قائمة جديدة' : 'New Playlist'}
            </Text>
          </TouchableOpacity>
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
            placeholder={
              lang === 'ar'
                ? 'ابحث في القوائم، السور، أو القراء...'
                : 'Search playlists, surahs, or reciters...'
            }
            placeholderTextColor="#6B8E7C"
            returnKeyType="search"
          />
          <View style={styles.searchIconBox}>
            <SearchIcon size={20} color="#6B8E7C" />
          </View>
        </View>

        {/* Category Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoriesScroll,
            isRtl && styles.rtlRow,
          ]}
        >
          {[
            { key: 'all', ar: 'الكل', en: 'All' },
            { key: 'wird', ar: 'أوراد وتحصين', en: 'Wird & Protection' },
            { key: 'podcast', ar: 'بودكاست التدبر', en: 'Podcasts' },
            { key: 'masterpieces', ar: 'روائع نادرة', en: 'Masterpieces' },
            { key: 'khatmah', ar: 'ختمات الليل', en: 'Khatmah' },
            { key: 'favorites', ar: 'المفضلة', en: 'Favorites' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                    { fontFamily: FONTS.tajawal },
                  ]}
                >
                  {lang === 'ar' ? cat.ar : cat.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= FEATURED HERO PLAYLIST CARD ================= */}
        {selectedCategory === 'all' && !searchQuery.trim() && featuredPlaylist && (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => handleSelectPlaylist(featuredPlaylist)}
            activeOpacity={0.9}
          >
            {/* Top Row: Badge + Favorite Heart */}
            <View style={[styles.heroCardTop, isRtl && styles.rtlRow]}>
              <View style={[styles.heroBadgeRow, isRtl && styles.rtlRow]}>
                <View style={styles.heroBadgePill}>
                  <Text style={styles.heroBadgeText}>
                    {lang === 'ar' ? 'الورد المميز لليوم' : 'Daily Featured Wird'}
                  </Text>
                </View>

                {featuredPlaylist.visibility === 'private' ? (
                  <View style={styles.cardLockPill}>
                    <LockIcon size={11} color="#D4AF37" />
                    <Text style={styles.cardLockText}>
                      {lang === 'ar' ? 'خاصة' : 'Private'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cardPublicPill}>
                    <GlobeIcon size={11} color="#2DD4BF" />
                    <Text style={styles.cardPublicText}>
                      {lang === 'ar' ? 'عامة' : 'Public'}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleFavoritePlaylist(featuredPlaylist.id);
                }}
                style={styles.heroHeartBtn}
              >
                {featuredPlaylist.isFavorite ? (
                  <HeartFilledIcon size={20} color="#E06D6D" />
                ) : (
                  <StarFavoriteIcon size={20} color="#D4AF37" />
                )}
              </TouchableOpacity>
            </View>

            {/* Title & Description */}
            <Text
              style={[
                styles.heroTitle,
                { fontFamily: FONTS.tajawal },
                isRtl ? styles.alignRtlText : styles.alignLtrText,
              ]}
            >
              {lang === 'ar'
                ? featuredPlaylist.titleAr
                : featuredPlaylist.titleEn}
            </Text>

            <Text
              style={[
                styles.heroSubtitle,
                isRtl ? styles.alignRtlText : styles.alignLtrText,
              ]}
              numberOfLines={2}
            >
              {lang === 'ar'
                ? featuredPlaylist.subtitleAr
                : featuredPlaylist.subtitleEn}
            </Text>

            {/* Bottom Meta & Play All Button */}
            <View style={[styles.heroFooterRow, isRtl && styles.rtlRow]}>
              <View
                style={[
                  styles.heroMetaCol,
                  isRtl ? styles.alignRtl : styles.alignLtr,
                ]}
              >
                <Text style={styles.heroMetaText}>
                  {featuredPlaylist.tracks.length}{' '}
                  {lang === 'ar' ? 'تلاوات' : 'tracks'} •{' '}
                  {featuredPlaylist.totalDuration}
                </Text>
                <Text style={styles.heroOwnerText}>
                  {lang === 'ar' ? 'بواسطة:' : 'By:'}{' '}
                  {lang === 'ar'
                    ? featuredPlaylist.ownerAr
                    : featuredPlaylist.ownerEn}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.heroPlayBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickPlayAll(featuredPlaylist);
                }}
                activeOpacity={0.85}
              >
                <PlayIcon size={16} color="#0A221C" />
                <Text style={styles.heroPlayBtnText}>
                  {lang === 'ar' ? 'تشغيل الورد' : 'Play Wird'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Section Title: All Folders & Playlists */}
        <View style={[styles.sectionTitleRow, isRtl && styles.rtlRow]}>
          <Text
            style={[
              styles.sectionTitleText,
              { fontFamily: FONTS.tajawal },
            ]}
          >
            {lang === 'ar' ? 'جميع القوائم والمجلدات' : 'All Playlists & Folders'}
          </Text>
          <Text style={styles.sectionCountBadge}>
            {filteredPlaylists.length} {lang === 'ar' ? 'قوائم' : 'items'}
          </Text>
        </View>

        {/* Gesture Tip Pill (clean, no emojis) */}
        <View style={[styles.gestureTipRow, isRtl && styles.rtlRow]}>
          <Text style={styles.gestureTipText}>
            {lang === 'ar'
              ? 'اسحب لليمين للحذف • اسحب لليسار لتعديل القائمة'
              : 'Swipe right to delete • Swipe left to edit'}
          </Text>
        </View>

        {/* Playlists List Cards with Swipe Gestures */}
        <View style={styles.playlistsStack}>
          {filteredPlaylists.map((playlist) => {
            const isPlayingThis =
              playingTrack &&
              playlist.tracks.some((tr) => tr.id === playingTrack.id);
            const isOwner =
              playlist.ownerId === 'user-me' ||
              playlist.ownerAr === user.displayName ||
              playlist.ownerAr.includes('أنت');

            return (
              <SwipeablePlaylistItem
                key={playlist.id}
                playlist={playlist}
                isRtl={isRtl}
                lang={lang}
                isPlayingThis={!!isPlayingThis}
                onPress={() => handleSelectPlaylist(playlist)}
                onQuickPlay={() => handleQuickPlayAll(playlist)}
                onDeleteRequest={handleDeletePlaylistRequest}
                onEditRequest={handleOpenEditModal}
                isOwner={isOwner}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* ================= FLOATING MINI AUDIO PLAYER BAR ================= */}
      {playingTrack && (
        <View style={[styles.miniPlayerBar, isRtl && styles.rtlRow]}>
          {/* Track Info */}
          <View
            style={[
              styles.miniPlayerInfo,
              isRtl ? styles.alignRtl : styles.alignLtr,
            ]}
          >
            <View style={[styles.miniPlayerLiveRow, isRtl && styles.rtlRow]}>
              <View style={styles.pulsingGoldDot} />
              <Text style={styles.miniPlayerLiveTag}>
                {isPlaying
                  ? lang === 'ar'
                    ? 'جارٍ الاستماع الآن'
                    : 'Now Playing'
                  : lang === 'ar'
                  ? 'متوقف مؤقتاً'
                  : 'Paused'}
              </Text>
            </View>
            <Text
              style={[
                styles.miniPlayerSurahTitle,
                { fontFamily: lang === 'ar' ? FONTS.amiri : FONTS.tajawal },
              ]}
              numberOfLines={1}
            >
              {lang === 'ar' ? playingTrack.surahAr : playingTrack.surahEn} (
              {playingTrack.ayahRange})
            </Text>
            <Text style={styles.miniPlayerQari} numberOfLines={1}>
              {lang === 'ar' ? playingTrack.qariAr : playingTrack.qariEn} •{' '}
              {playingTrack.duration}
            </Text>
          </View>

          {/* Controls: Skip Prev, Play/Pause, Skip Next, Close */}
          <View style={[styles.miniPlayerControls, isRtl && styles.rtlRow]}>
            <TouchableOpacity
              onPress={handleSkipPrev}
              style={styles.miniCtrlBtn}
            >
              <SkipPrevIcon size={16} color="#D4AF37" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.miniPlayBtn}
            >
              {isPlaying ? (
                <PauseIcon size={14} color="#0A221C" />
              ) : (
                <PlayIcon size={14} color="#0A221C" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkipNext}
              style={styles.miniCtrlBtn}
            >
              <SkipNextIcon size={16} color="#D4AF37" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPlayingTrack(null);
                setIsPlaying(false);
              }}
              style={styles.miniCloseBtn}
            >
              <CloseIcon size={16} color="#8A9E96" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================= */}
      {/* ====== PLAYLIST DETAILS MODAL (TRACKS & RECITERS LIST) == */}
      {/* ========================================================= */}
      <Modal
        visible={activePlaylist !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePlaylist(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setActivePlaylist(null)}
          />

          <View style={styles.playlistDetailsSheet}>
            <View style={styles.sheetHandleBar} />

            {/* Header: Title, Category & Visibility Badges, and Close Button */}
            {(() => {
              if (!activePlaylist) return null;
              const isOwner =
                activePlaylist.ownerId === 'user-me' ||
                activePlaylist.ownerAr === user.displayName ||
                activePlaylist.ownerAr.includes('أنت');
              const canEdit =
                isOwner || activePlaylist.editPermission === 'members_can_edit';

              return (
                <>
                  <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
                    <View style={[styles.detailsHeaderCol, isRtl && styles.alignRtl]}>
                      <View style={[styles.detailsBadgeRow, isRtl && styles.rtlRow]}>
                        <View style={styles.playlistBadgePill}>
                          <Text style={styles.playlistBadgeText}>
                            {lang === 'ar'
                              ? activePlaylist?.badgeAr
                              : activePlaylist?.badgeEn}
                          </Text>
                        </View>

                        {/* Visibility Pill (Public / Private) */}
                        {activePlaylist?.visibility === 'private' ? (
                          <View style={styles.visibilityPillPrivate}>
                            <LockIcon size={11} color="#D4AF37" />
                            <Text style={styles.visibilityPillTextPrivate}>
                              {lang === 'ar' ? 'خاصة برمز' : 'Private (Code)'}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.visibilityPillPublic}>
                            <GlobeIcon size={11} color="#2DD4BF" />
                            <Text style={styles.visibilityPillTextPublic}>
                              {lang === 'ar' ? 'قائمة عامة' : 'Public'}
                            </Text>
                          </View>
                        )}

                        <Text style={styles.detailsDurationText}>
                          {activePlaylist?.totalDuration}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.detailsSheetTitle,
                          { fontFamily: FONTS.tajawal },
                        ]}
                        numberOfLines={1}
                      >
                        {lang === 'ar'
                          ? activePlaylist?.titleAr
                          : activePlaylist?.titleEn}
                      </Text>
                      <Text
                        style={styles.detailsSheetSubtitle}
                        numberOfLines={2}
                      >
                        {lang === 'ar'
                          ? activePlaylist?.subtitleAr
                          : activePlaylist?.subtitleEn}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setActivePlaylist(null)}
                      style={styles.modalCloseBtn}
                    >
                      <CloseIcon size={20} color="#8A9E96" />
                    </TouchableOpacity>
                  </View>

                  {/* Private Playlist Invite Code Banner */}
                  {activePlaylist?.visibility === 'private' && (
                    <View style={[styles.inviteCodeCard, isRtl && styles.rtlRow]}>
                      <KeyIcon size={16} color="#D4AF37" />
                      <Text style={styles.inviteCodeLabel}>
                        {lang === 'ar' ? 'رمز الدعوة للأعضاء:' : 'Invite Code:'}
                      </Text>
                      <Text style={styles.inviteCodeBadge}>
                        {activePlaylist.inviteCode || 'KHTM-9182'}
                      </Text>
                      {isOwner && (
                        <TouchableOpacity
                          style={[styles.copyCodeBtn, isRtl && styles.rtlRow]}
                          onPress={() => {
                            showToast(
                              lang === 'ar'
                                ? `تم نسخ رمز الدعوة: ${activePlaylist.inviteCode}`
                                : `Copied invite code: ${activePlaylist.inviteCode}`
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <ShareIcon size={13} color="#0A221C" />
                          <Text style={styles.copyCodeBtnText}>
                            {lang === 'ar' ? 'مشاركة' : 'Share'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Admin Permissions Control Bar vs Member View */}
                  {isOwner ? (
                    <View style={[styles.adminControlBar, isRtl && styles.rtlRow]}>
                      <Text style={styles.adminBadgeTag}>
                        {lang === 'ar' ? 'أنت المشرف' : 'You are Admin'}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.permToggleBtn,
                          activePlaylist.editPermission === 'members_can_edit'
                            ? styles.permToggleBtnActive
                            : styles.permToggleBtnLocked,
                          isRtl && styles.rtlRow,
                        ]}
                        onPress={handleToggleEditPermission}
                        activeOpacity={0.8}
                      >
                        {activePlaylist.editPermission === 'admin_only' ? (
                          <LockIcon size={12} color="#D4AF37" />
                        ) : (
                          <GlobeIcon size={12} color="#2DD4BF" />
                        )}
                        <Text style={styles.permToggleBtnText}>
                          {activePlaylist.editPermission === 'admin_only'
                            ? (lang === 'ar'
                                ? 'التعديل: للمشرف فقط (اضغط للسماح)'
                                : 'Edit: Admin Only (Tap to allow)')
                            : (lang === 'ar'
                                ? 'التعديل: متاح للأعضاء (اضغط لتقييده)'
                                : 'Edit: Members Allowed (Tap to lock)')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.memberNoticeBar, isRtl && styles.rtlRow]}>
                      {activePlaylist?.editPermission === 'admin_only' ? (
                        <>
                          <LockIcon size={13} color="#8A9E96" />
                          <Text style={styles.memberNoticeText}>
                            {lang === 'ar'
                              ? 'تعديل السور مقتصر على مشرف القائمة (استماع فقط)'
                              : 'Editing restricted to playlist admin (Listen only)'}
                          </Text>
                        </>
                      ) : (
                        <>
                          <GlobeIcon size={13} color="#2DD4BF" />
                          <Text style={[styles.memberNoticeText, { color: '#2DD4BF' }]}>
                            {lang === 'ar'
                              ? 'صلاحية التعديل متاحة: يمكنك إضافة وحذف السور'
                              : 'Collaborative: you can add and remove recitations'}
                          </Text>
                        </>
                      )}
                    </View>
                  )}

                  {/* Action Bar: Play All, Shuffle, Add Track */}
                  <View style={[styles.detailsActionRow, isRtl && styles.rtlRow]}>
                    <TouchableOpacity
                      style={styles.playAllActionBtn}
                      onPress={() => activePlaylist && handlePlayAll(activePlaylist)}
                      activeOpacity={0.85}
                    >
                      <PlayIcon size={14} color="#0A221C" />
                      <Text style={styles.playAllActionBtnText}>
                        {lang === 'ar' ? 'تشغيل الكل' : 'Play All'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.shuffleActionBtn,
                        isShuffleOn && styles.shuffleActionBtnActive,
                      ]}
                      onPress={() => setIsShuffleOn(!isShuffleOn)}
                      activeOpacity={0.8}
                    >
                      <ShuffleIcon
                        size={16}
                        color={isShuffleOn ? '#0A221C' : '#D4AF37'}
                      />
                      <Text
                        style={[
                          styles.shuffleActionBtnText,
                          isShuffleOn && styles.shuffleActionBtnTextActive,
                        ]}
                      >
                        {lang === 'ar' ? 'خلط' : 'Shuffle'}
                      </Text>
                    </TouchableOpacity>

                    {canEdit && (
                      <TouchableOpacity
                        style={[styles.addTrackActionBtn, isRtl && styles.rtlRow]}
                        onPress={() => setIsAddTrackModalOpen(true)}
                        activeOpacity={0.8}
                      >
                        <PlusIcon size={14} color="#0A221C" />
                        <Text style={styles.addTrackActionBtnText}>
                          {lang === 'ar' ? 'إضافة سورة' : 'Add Surah'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Scrollable List of Tracks in this Playlist */}
                  <ScrollView
                    style={styles.tracksScrollView}
                    contentContainerStyle={styles.tracksScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {activePlaylist && activePlaylist.tracks.length === 0 ? (
                      <View style={styles.emptyTracksContainer}>
                        <View style={{ marginBottom: 12 }}>
                          <QuranBookIcon size={34} color="#6B8E7C" />
                        </View>
                        <Text
                          style={[
                            styles.emptyTracksTitle,
                            { fontFamily: FONTS.tajawal },
                          ]}
                        >
                          {lang === 'ar'
                            ? 'لا توجد سور في هذه القائمة بعد'
                            : 'No Surahs in this playlist yet'}
                        </Text>
                        <Text style={styles.emptyTracksSubtitle}>
                          {canEdit
                            ? (lang === 'ar'
                                ? 'بصفتك المشرف، اضغط على زر «إضافة سورة» لاختيار السور والقراء من الفهرس الكامل (١١٤ سورة).'
                                : 'As admin, tap "Add Surah" to choose Surahs and Reciters from the full catalog (114 Surahs).')
                            : (lang === 'ar'
                                ? 'لم يقم مشرف القائمة بإضافة سور بعد. يرجى الانتظار حتى يقوم المشرف بتحديثها.'
                                : 'The admin has not added recitations yet. Please check back later.')}
                        </Text>
                        {canEdit && (
                          <TouchableOpacity
                            style={[styles.emptyTracksAddBtn, isRtl && styles.rtlRow]}
                            onPress={() => setIsAddTrackModalOpen(true)}
                            activeOpacity={0.85}
                          >
                            <PlusIcon size={16} color="#0A221C" />
                            <Text style={styles.emptyTracksAddBtnText}>
                              {lang === 'ar' ? 'إضافة أول سورة الآن' : 'Add First Surah Now'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      activePlaylist?.tracks.map((track, index) => {
                        const isThisTrackPlaying =
                          playingTrack?.id === track.id && isPlaying;

                        return (
                          <View
                            key={track.id}
                            style={[
                              styles.trackItemRow,
                              isRtl && styles.rtlRow,
                              isThisTrackPlaying && styles.trackItemRowPlaying,
                            ]}
                          >
                            {/* Track Number Badge */}
                            <View
                              style={[
                                styles.trackIndexBadge,
                                isThisTrackPlaying && styles.trackIndexBadgePlaying,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.trackIndexText,
                                  isThisTrackPlaying && styles.trackIndexTextPlaying,
                                ]}
                              >
                                #{index + 1}
                              </Text>
                            </View>

                            {/* Track Titles & Reciter */}
                            <View
                              style={[
                                styles.trackDetailsCol,
                                isRtl ? styles.alignRtl : styles.alignLtr,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.trackSurahTitle,
                                  {
                                    fontFamily:
                                      lang === 'ar' ? FONTS.amiri : FONTS.tajawal,
                                  },
                                  isThisTrackPlaying && styles.trackSurahTitlePlaying,
                                ]}
                                numberOfLines={1}
                              >
                                {lang === 'ar' ? track.surahAr : track.surahEn}{' '}
                                <Text style={styles.trackAyahSpan}>
                                  ({track.ayahRange})
                                </Text>
                              </Text>

                              <Text style={styles.trackQariName} numberOfLines={1}>
                                {lang === 'ar' ? track.qariAr : track.qariEn} •{' '}
                                {track.duration}
                              </Text>
                            </View>

                            {/* Track Action: Play/Pause Toggle & Delete (if permitted) */}
                            <View style={[styles.trackActionsRow, isRtl && styles.rtlRow]}>
                              <TouchableOpacity
                                style={[
                                  styles.trackPlayBtn,
                                  isThisTrackPlaying && styles.trackPlayBtnPlaying,
                                ]}
                                onPress={() => handlePlayTrack(track)}
                                activeOpacity={0.8}
                              >
                                {isThisTrackPlaying ? (
                                  <PauseIcon size={12} color="#0A221C" />
                                ) : (
                                  <PlayIcon size={12} color="#D4AF37" />
                                )}
                              </TouchableOpacity>

                              {canEdit && (
                                <TouchableOpacity
                                  style={styles.trackDeleteBtn}
                                  onPress={() => handleDeleteTrack(track.id)}
                                  activeOpacity={0.7}
                                >
                                  <TrashIcon size={15} color="#E06D6D" />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ====== ADD TRACK TO PLAYLIST MODAL (114 SURAHS & QARIS) = */}
      {/* ========================================================= */}
      <Modal
        visible={isAddTrackModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddTrackModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsAddTrackModalOpen(false)}
          />
          <View style={styles.selectorModalSheet}>
            <View style={styles.sheetHandleBar} />

            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>
                {lang === 'ar'
                  ? 'إضافة سورة وقارئ إلى القائمة'
                  : 'Add Surah & Qari to Playlist'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddTrackModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            {/* Selection Summary Banner */}
            <View style={[styles.suggestSelectionBanner, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.suggestBannerPill,
                  addModalTab === 'surah' && styles.suggestBannerPillActive,
                  isRtl && styles.rtlRow,
                ]}
                onPress={() => setAddModalTab('surah')}
              >
                <Text style={styles.suggestBannerLabel}>
                  {lang === 'ar' ? 'السورة:' : 'Surah:'}
                </Text>
                <Text style={styles.suggestBannerValue} numberOfLines={1}>
                  {lang === 'ar'
                    ? `سورة ${addSelectedSurahObj.nameAr}`
                    : `Surah ${addSelectedSurahObj.nameEn}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.suggestBannerPill,
                  addModalTab === 'reciter' && styles.suggestBannerPillActive,
                  isRtl && styles.rtlRow,
                ]}
                onPress={() => setAddModalTab('reciter')}
              >
                <Text style={styles.suggestBannerLabel}>
                  {lang === 'ar' ? 'القارئ:' : 'Qari:'}
                </Text>
                <Text style={styles.suggestBannerValue} numberOfLines={1}>
                  {lang === 'ar'
                    ? addSelectedReciterObj.nameAr
                    : addSelectedReciterObj.nameEn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-Tabs: 114 Surahs vs Famous Reciters */}
            <View style={[styles.suggestTabRow, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.suggestTabBtn,
                  addModalTab === 'surah' && styles.suggestTabBtnActive,
                ]}
                onPress={() => setAddModalTab('surah')}
              >
                <Text
                  style={[
                    styles.suggestTabBtnText,
                    addModalTab === 'surah' && styles.suggestTabBtnTextActive,
                  ]}
                >
                  {lang === 'ar' ? 'سور القرآن (١١٤)' : 'Surahs (114)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.suggestTabBtn,
                  addModalTab === 'reciter' && styles.suggestTabBtnActive,
                ]}
                onPress={() => setAddModalTab('reciter')}
              >
                <Text
                  style={[
                    styles.suggestTabBtnText,
                    addModalTab === 'reciter' && styles.suggestTabBtnTextActive,
                  ]}
                >
                  {lang === 'ar' ? 'القراء المشاهير' : 'Famous Reciters'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
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
                  addModalTab === 'surah' ? addSurahSearch : addReciterSearch
                }
                onChangeText={
                  addModalTab === 'surah'
                    ? setAddSurahSearch
                    : setAddReciterSearch
                }
                placeholder={
                  addModalTab === 'surah'
                    ? lang === 'ar'
                      ? 'ابحث باسم السورة أو رقمها (١-١١٤)...'
                      : 'Search by surah name or number...'
                    : lang === 'ar'
                    ? 'ابحث باسم القارئ...'
                    : 'Search by reciter name...'
                }
                placeholderTextColor="#6B8E7C"
              />
              {(addModalTab === 'surah' ? addSurahSearch : addReciterSearch)
                .length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    addModalTab === 'surah'
                      ? setAddSurahSearch('')
                      : setAddReciterSearch('')
                  }
                >
                  <CloseIcon size={16} color="#8A9E96" />
                </TouchableOpacity>
              )}
            </View>

            {/* List Selection */}
            {addModalTab === 'surah' ? (
              <ScrollView
                style={styles.pickerListScroll}
                contentContainerStyle={styles.pickerListContent}
                showsVerticalScrollIndicator={false}
              >
                {addFilteredSurahs.map((surah) => {
                  const isSelected = addSurahNumber === surah.number;
                  return (
                    <TouchableOpacity
                      key={surah.number}
                      style={[
                        styles.pickerItemRow,
                        isRtl && styles.rtlRow,
                        isSelected && styles.pickerItemRowSelected,
                      ]}
                      onPress={() => setAddSurahNumber(surah.number)}
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
                            : `${surah.nameAr} • ${surah.ayahsCount} verses`}
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
                style={styles.pickerListScroll}
                contentContainerStyle={styles.pickerListContent}
                showsVerticalScrollIndicator={false}
              >
                {addFilteredReciters.map((reciter) => {
                  const isSelected = addReciterId === reciter.id;
                  return (
                    <TouchableOpacity
                      key={reciter.id}
                      style={[
                        styles.pickerItemRow,
                        isRtl && styles.rtlRow,
                        isSelected && styles.pickerItemRowSelected,
                      ]}
                      onPress={() => setAddReciterId(reciter.id)}
                    >
                      <View
                        style={[
                          styles.qariIconBadge,
                          isSelected && styles.qariIconBadgeSelected,
                        ]}
                      >
                        <HeadphonesIcon size={18} color={isSelected ? '#0A221C' : '#D4AF37'} />
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

            {/* Quick Ayah Chips */}
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
                contentContainerStyle={[styles.ayahChipsRow, isRtl && styles.rtlRow]}
              >
                {[
                  { ar: 'كامل السورة', en: 'Full Surah' },
                  { ar: 'آية ١ – ١٠', en: 'Ayah 1–10' },
                  { ar: 'آية ١ – ٢٥', en: 'Ayah 1–25' },
                  { ar: 'آية ٢٥ – ٥٠', en: 'Ayah 25–50' },
                  { ar: 'أول ٥ آيات', en: 'First 5 Ayahs' },
                ].map((chip) => {
                  const label = lang === 'ar' ? chip.ar : chip.en;
                  const isSelected = addAyahRange === label;
                  return (
                    <TouchableOpacity
                      key={chip.en}
                      style={[
                        styles.ayahChipBtn,
                        isSelected && styles.ayahChipBtnSelected,
                      ]}
                      onPress={() => setAddAyahRange(label)}
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

            {/* Submit Add Track Button */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleAddTrackSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>
                {lang === 'ar' ? 'تأكيد وإضافة للقائمة' : 'Confirm & Add Track'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ====== IN-APP TOAST ALERT ================================ */}
      {/* ========================================================= */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* ========================================================= */}
      {/* ====== CREATE NEW PLAYLIST MODAL (NORMAL PLAYLIST ALGO) == */}
      {/* ========================================================= */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsCreateModalOpen(false)}
          />
          <View style={styles.createModalSheet}>
            <View style={styles.sheetHandleBar} />

            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>
                {lang === 'ar'
                  ? 'إنشاء قائمة استماع جديدة'
                  : 'Create New Playlist'}
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
              contentContainerStyle={styles.createModalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Name input (Required) */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar' ? 'اسم القائمة *' : 'Playlist Name *'}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: ورد الفجر، سورة الكهف، تلاوات خاشعة'
                      : 'e.g., Dawn Wird, Surah Al-Kahf, Night Prayers'
                  }
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* 2. Description input (Optional) */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? 'الوصف (اختياري)'
                    : 'Description (Optional)'}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  value={newDesc}
                  onChangeText={setNewDesc}
                  placeholder={
                    lang === 'ar'
                      ? 'وصف توضيحي لمحتوى القائمة وفضلها...'
                      : 'Brief description of the playlist content...'
                  }
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* 3. Visibility Selector: Public vs Private */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar' ? 'نوع الخصوصية *' : 'Visibility *'}
                </Text>

                <View style={[styles.visChoiceRow, isRtl && styles.rtlRow]}>
                  {/* Public Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      newVisibility === 'public' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setNewVisibility('public')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <GlobeIcon size={20} color={newVisibility === 'public' ? '#2DD4BF' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        newVisibility === 'public' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'عامة (Public)' : 'Public'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'يمكن لأي شخص الدخول والاستماع'
                        : 'Anyone can discover and listen'}
                    </Text>
                  </TouchableOpacity>

                  {/* Private Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      newVisibility === 'private' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setNewVisibility('private')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <LockIcon size={20} color={newVisibility === 'private' ? '#D4AF37' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        newVisibility === 'private' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'خاصة (Private)' : 'Private'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'دخول مغلق برمز دعوة خاص يشاركه المشرف'
                        : 'Requires invite code from admin to enter'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {newVisibility === 'private' && (
                  <View style={[styles.codeHintBox, isRtl && styles.rtlRow]}>
                    <KeyIcon size={14} color="#D4AF37" />
                    <Text style={styles.codeHintText}>
                      {lang === 'ar'
                        ? 'سيتم إنشاء رمز دعوة تلقائي (مثل PL-4921) عند الحفظ لتشاركه مع المدعوين.'
                        : 'An invite code (e.g. PL-4921) will be auto-generated for you to share.'}
                    </Text>
                  </View>
                )}
              </View>

              {/* 4. Edit Restriction Setting (Admin Only vs Members Can Edit) */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? 'صلاحية تعديل وإضافة السور *'
                    : 'Edit Permission *'}
                </Text>

                <View style={[styles.visChoiceRow, isRtl && styles.rtlRow]}>
                  {/* Admin Only Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      newEditPermission === 'admin_only' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setNewEditPermission('admin_only')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <LockIcon size={20} color={newEditPermission === 'admin_only' ? '#D4AF37' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        newEditPermission === 'admin_only' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'المشرف فقط (Admin Only)' : 'Admin Only'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'أنت فقط من يضيف ويحذف السور (استماع فقط للأعضاء)'
                        : 'Only you can add and remove recitations'}
                    </Text>
                  </TouchableOpacity>

                  {/* Members Can Edit Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      newEditPermission === 'members_can_edit' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setNewEditPermission('members_can_edit')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <GlobeIcon size={20} color={newEditPermission === 'members_can_edit' ? '#2DD4BF' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        newEditPermission === 'members_can_edit' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'السماح للأعضاء (Collab)' : 'Members Allowed'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'تعديل تعاوني: يمكن للأعضاء والمدعوين إضافة سور'
                        : 'Collaborative: members can also add Surahs'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Create Button */}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  !newTitle.trim() && styles.primaryActionDisabled,
                ]}
                onPress={handleCreatePlaylistSubmit}
                disabled={!newTitle.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  {lang === 'ar' ? 'إنشاء القائمة والبدء بإضافة السور' : 'Create Playlist & Add Surahs'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ====== PRIVATE PLAYLIST UNLOCK (INVITE CODE) MODAL ====== */}
      {/* ========================================================= */}
      <Modal
        visible={isPrivateUnlockModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsPrivateUnlockModalOpen(false);
          setPendingPrivatePlaylist(null);
        }}
      >
        <View style={styles.modalBackdropCenter}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setIsPrivateUnlockModalOpen(false);
              setPendingPrivatePlaylist(null);
            }}
          />

          <View style={styles.unlockModalBox}>
            <View style={styles.unlockModalIconBox}>
              <LockIcon size={24} color="#D4AF37" />
            </View>

            <Text
              style={[
                styles.unlockModalTitle,
                { fontFamily: FONTS.tajawal },
              ]}
            >
              {lang === 'ar' ? 'قائمة استماع خاصة' : 'Private Playlist'}
            </Text>

            <Text style={styles.unlockModalDesc}>
              {lang === 'ar'
                ? `هذه القائمة خاصة وتتطلب رمز دعوة من مشرفها (${pendingPrivatePlaylist?.ownerAr || 'المشرف'}) للدخول:`
                : `This playlist is private and requires an invite code from the admin (${pendingPrivatePlaylist?.ownerEn || 'Admin'}) to enter:`}
            </Text>

            <TextInput
              style={[
                styles.unlockCodeInput,
                { fontFamily: FONTS.tajawal },
              ]}
              value={inviteCodeInput}
              onChangeText={(txt) => {
                setInviteCodeInput(txt);
                setInviteCodeError('');
              }}
              placeholder={lang === 'ar' ? 'أدخل رمز الدعوة (مثل TAHJ-7821)' : 'Enter invite code (e.g. TAHJ-7821)'}
              placeholderTextColor="#6B8E7C"
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleUnlockPrivateSubmit}
            />

            {inviteCodeError ? (
              <Text style={styles.unlockErrorText}>{inviteCodeError}</Text>
            ) : null}

            <View style={[styles.unlockButtonsRow, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={styles.unlockCancelBtn}
                onPress={() => {
                  setIsPrivateUnlockModalOpen(false);
                  setPendingPrivatePlaylist(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.unlockCancelBtnText}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unlockSubmitBtn}
                onPress={handleUnlockPrivateSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.unlockSubmitBtnText}>
                  {lang === 'ar' ? 'دخول القائمة' : 'Unlock & Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ====== DELETE PLAYLIST CONFIRMATION MODAL =============== */}
      {/* ========================================================= */}
      <Modal
        visible={deletingPlaylist !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingPlaylist(null)}
      >
        <View style={styles.modalBackdropCenter}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setDeletingPlaylist(null)}
          />

          <View style={[styles.deleteConfirmModalBox, { zIndex: 30, elevation: 30 }]}>
            <View style={styles.deleteModalIconBox}>
              <TrashIcon size={26} color="#FFFFFF" />
            </View>

            <Text
              style={[
                styles.deleteModalTitle,
                { fontFamily: FONTS.tajawal },
              ]}
            >
              {lang === 'ar' ? 'حذف قائمة الاستماع' : 'Delete Playlist'}
            </Text>

            <Text style={styles.deleteModalDesc}>
              {lang === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف قائمة «${deletingPlaylist?.titleAr}» نهائياً؟`
                : `Are you sure you want to permanently delete «${deletingPlaylist?.titleEn}»?`}
            </Text>

            <View style={[styles.unlockButtonsRow, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={styles.unlockCancelBtn}
                onPress={() => setDeletingPlaylist(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.unlockCancelBtnText}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmDeletePlaylist}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteConfirmBtnText}>
                  {lang === 'ar' ? 'نعم، حذف' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ====== EDIT PLAYLIST MODAL (ADMIN ONLY) ================= */}
      {/* ========================================================= */}
      <Modal
        visible={editingPlaylist !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingPlaylist(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setEditingPlaylist(null)}
          />
          <View style={styles.createModalSheet}>
            <View style={styles.sheetHandleBar} />

            <View style={[styles.modalHeaderRow, isRtl && styles.rtlRow]}>
              <Text style={styles.modalTitleText}>
                {lang === 'ar'
                  ? 'تعديل بيانات القائمة'
                  : 'Edit Playlist Settings'}
              </Text>
              <TouchableOpacity
                onPress={() => setEditingPlaylist(null)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#8A9E96" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.createModalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Name input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar' ? 'اسم القائمة *' : 'Playlist Name *'}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder={
                    lang === 'ar'
                      ? 'عنوان القائمة...'
                      : 'Playlist Title...'
                  }
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* 2. Description input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? 'الوصف (اختياري)'
                    : 'Description (Optional)'}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                    { fontFamily: FONTS.tajawal },
                  ]}
                  value={editDesc}
                  onChangeText={setEditDesc}
                  placeholder={
                    lang === 'ar'
                      ? 'وصف القائمة وفضل التلاوات...'
                      : 'Brief description...'
                  }
                  placeholderTextColor="#6B8E7C"
                />
              </View>

              {/* 3. Member Edit Permission Setting */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar'
                    ? 'صلاحية تعديل وإضافة السور للأعضاء *'
                    : 'Members Edit Permission *'}
                </Text>

                <View style={[styles.visChoiceRow, isRtl && styles.rtlRow]}>
                  {/* Admin Only Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      editPermission === 'admin_only' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setEditPermission('admin_only')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <LockIcon size={20} color={editPermission === 'admin_only' ? '#D4AF37' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        editPermission === 'admin_only' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'المشرف فقط' : 'Admin Only'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'المشرف وحده يضيف ويحذف السور (استماع فقط للأعضاء)'
                        : 'Only admin can add and remove recitations'}
                    </Text>
                  </TouchableOpacity>

                  {/* Members Can Edit Option */}
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      editPermission === 'members_can_edit' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setEditPermission('members_can_edit')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <GlobeIcon size={20} color={newEditPermission === 'members_can_edit' ? '#2DD4BF' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        editPermission === 'members_can_edit' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'السماح للأعضاء' : 'Members Allowed'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'تعديل تعاوني: يمكن للأعضاء والمدعوين إضافة سور'
                        : 'Collaborative: members can also add Surahs'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Visibility Setting */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    isRtl ? styles.alignRtlText : styles.alignLtrText,
                  ]}
                >
                  {lang === 'ar' ? 'نوع الخصوصية' : 'Visibility'}
                </Text>

                <View style={[styles.visChoiceRow, isRtl && styles.rtlRow]}>
                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      editVisibility === 'public' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setEditVisibility('public')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <GlobeIcon size={20} color={editVisibility === 'public' ? '#2DD4BF' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        editVisibility === 'public' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'عامة (Public)' : 'Public'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'متاحة للجميع للاستماع'
                        : 'Anyone can discover and listen'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visChoiceCard,
                      editVisibility === 'private' && styles.visChoiceCardActive,
                    ]}
                    onPress={() => setEditVisibility('private')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.visIconBox}>
                      <LockIcon size={20} color={editVisibility === 'private' ? '#D4AF37' : '#8A9E96'} />
                    </View>
                    <Text
                      style={[
                        styles.visChoiceTitle,
                        editVisibility === 'private' && styles.visChoiceTitleActive,
                      ]}
                    >
                      {lang === 'ar' ? 'خاصة (Private)' : 'Private'}
                    </Text>
                    <Text style={styles.visChoiceDesc}>
                      {lang === 'ar'
                        ? 'دخول محمي برمز دعوة خاص'
                        : 'Requires invite code to enter'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  !editTitle.trim() && styles.primaryActionDisabled,
                ]}
                onPress={handleSavePlaylistEdits}
                disabled={!editTitle.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
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

  /* Top Header Bar */
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: Platform.OS === 'android' ? 6 : 0,
    gap: 10,
  },
  headerTitles: {
    flex: 1,
    justifyContent: 'center',
  },
  screenTitle: {
    fontFamily: FONTS.tajawalExtraBold || FONTS.tajawalBold || FONTS.tajawal,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  screenSubtitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 12.5,
    color: '#8A9E96',
  },
  createPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  createPlaylistBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Search Bar */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#133A30',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
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
    fontSize: 13.5,
    color: '#FFFFFF',
    height: '100%',
  },
  rtlInput: {
    textAlign: 'right',
  },

  /* Categories Scroll */
  categoriesScroll: {
    gap: 8,
    paddingBottom: 18,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#133A30',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9E96',
  },
  categoryChipTextActive: {
    color: '#0A221C',
  },

  /* Hero Featured Playlist Card */
  heroCard: {
    backgroundColor: '#133A30',
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadgePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
  },
  heroHeartBtn: {
    padding: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#8A9E96',
    marginBottom: 16,
    lineHeight: 18,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroMetaCol: {
    flex: 1,
  },
  heroMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 2,
  },
  heroOwnerText: {
    fontSize: 11,
    color: '#6B8E7C',
  },
  heroPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  heroPlayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Section Title Row */
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCountBadge: {
    fontSize: 11.5,
    color: '#8A9E96',
    fontWeight: '600',
  },

  /* Playlists List Stack */
  playlistsStack: {
    gap: 12,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#133A30',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  playlistCardPlaying: {
    borderColor: '#D4AF37',
    backgroundColor: '#174438',
  },
  playlistIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastIconCircle: {
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
  },
  masterpieceIconCircle: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  playlistDetailsCol: {
    flex: 1,
  },
  playlistBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  playlistBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playlistBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },
  playlistCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playlistCardSubtitle: {
    fontSize: 11.5,
    color: '#8A9E96',
    marginBottom: 4,
  },
  playlistMetaSmall: {
    fontSize: 11,
    color: '#6B8E7C',
    fontWeight: '600',
  },
  playlistPlayMiniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistPlayMiniBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },

  /* Floating Mini Player Bar */
  miniPlayerBar: {
    position: 'absolute',
    bottom: 74,
    left: 14,
    right: 14,
    backgroundColor: '#163E32',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  miniPlayerInfo: {
    flex: 1,
    marginRight: 8,
  },
  miniPlayerLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 1,
  },
  pulsingGoldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  miniPlayerLiveTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D4AF37',
  },
  miniPlayerSurahTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniPlayerQari: {
    fontSize: 11,
    color: '#8A9E96',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniCtrlBtn: {
    padding: 6,
  },
  miniPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCloseBtn: {
    padding: 6,
  },

  /* Modal Backdrop & Sheets */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  playlistDetailsSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    height: '90%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailsHeaderCol: {
    flex: 1,
  },
  detailsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailsDurationText: {
    fontSize: 11,
    color: '#8A9E96',
    fontWeight: '600',
  },
  detailsSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  detailsSheetSubtitle: {
    fontSize: 12,
    color: '#8A9E96',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  detailsActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  playAllActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
  },
  playAllActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A221C',
  },
  shuffleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A221C',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 6,
  },
  shuffleActionBtnActive: {
    backgroundColor: '#D4AF37',
  },
  shuffleActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  shuffleActionBtnTextActive: {
    color: '#0A221C',
    fontWeight: '700',
  },
  addTrackActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#163E32',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 6,
  },
  addTrackActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },

  /* Tracks Scroll */
  tracksScrollView: {
    flex: 1,
  },
  tracksScrollContent: {
    paddingBottom: 20,
    gap: 8,
  },
  trackItemRow: {
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
  trackItemRowPlaying: {
    borderColor: '#D4AF37',
    backgroundColor: '#14382E',
  },
  trackIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexBadgePlaying: {
    backgroundColor: '#D4AF37',
  },
  trackIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9E96',
  },
  trackIndexTextPlaying: {
    color: '#0A221C',
  },
  trackDetailsCol: {
    flex: 1,
  },
  trackSurahTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trackSurahTitlePlaying: {
    color: '#D4AF37',
  },
  trackAyahSpan: {
    fontSize: 11,
    color: '#8A9E96',
    fontWeight: 'normal',
  },
  trackQariName: {
    fontSize: 11.5,
    color: '#D4AF37',
  },
  trackActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackPlayBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0A221C',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackPlayBtnPlaying: {
    backgroundColor: '#D4AF37',
  },
  trackDeleteBtn: {
    padding: 6,
  },

  /* Selector Modal Sheet */
  selectorModalSheet: {
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
  modalTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 10,
    gap: 6,
  },
  suggestTabBtn: {
    flex: 1,
    paddingVertical: 8,
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
    height: 42,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qariIconBadgeSelected: {
    backgroundColor: '#D4AF37',
  },
  qariEmoji: {
    fontSize: 15,
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
    marginBottom: 10,
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
  primaryActionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Toast Alert */
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    alignSelf: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  toastText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    fontWeight: '700',
    color: '#0A221C',
    textAlign: 'center',
  },

  /* Badges & Visibility Pills */
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityPillPublic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.28)',
  },
  visibilityPillTextPublic: {
    fontFamily: FONTS.tajawal,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  visibilityPillPrivate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.32)',
  },
  visibilityPillTextPrivate: {
    fontFamily: FONTS.tajawal,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D4AF37',
  },
  cardLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  cardLockText: {
    fontFamily: FONTS.tajawal,
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },
  cardPublicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  cardPublicText: {
    fontFamily: FONTS.tajawal,
    fontSize: 10,
    fontWeight: '700',
    color: '#2DD4BF',
  },
  cardCollabPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCollabText: {
    fontFamily: FONTS.tajawal,
    fontSize: 10,
    fontWeight: '600',
    color: '#E0E7E4',
  },

  /* Invite Code Card */
  inviteCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  inviteCodeLabel: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  inviteCodeBadge: {
    fontFamily: FONTS.tajawal,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: '#0A221C',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    letterSpacing: 1.2,
  },
  copyCodeBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyCodeBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Admin & Member Permissions Bars */
  adminControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  adminBadgeTag: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    color: '#D4AF37',
    fontWeight: '700',
  },
  permToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  permToggleBtnLocked: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  permToggleBtnActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
  },
  permToggleBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 10,
  },
  memberNoticeText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    color: '#8A9E96',
    fontWeight: '500',
  },

  /* Empty State for Playlist Tracks */
  emptyTracksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTracksEmoji: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyTracksTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyTracksSubtitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 12.5,
    color: '#8A9E96',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyTracksAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyTracksAddBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    fontWeight: '700',
    color: '#0A221C',
  },

  /* Create Modal Styles */
  createModalSheet: {
    backgroundColor: '#133A30',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  createModalScroll: {
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 7,
  },
  textInput: {
    backgroundColor: '#0A221C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* Visibility & Edit Restriction Choices */
  visChoiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visChoiceCard: {
    flex: 1,
    backgroundColor: '#0A221C',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  visChoiceCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  visIconBox: {
    marginBottom: 6,
  },
  visChoiceTitle: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    fontWeight: '700',
    color: '#8A9E96',
    marginBottom: 3,
  },
  visChoiceTitleActive: {
    color: '#D4AF37',
  },
  visChoiceDesc: {
    fontFamily: FONTS.tajawal,
    fontSize: 11,
    color: '#6B8E7C',
    lineHeight: 15,
  },
  codeHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  codeHintText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    color: '#D4AF37',
    flex: 1,
    lineHeight: 16,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },

  /* Private Playlist Unlock Modal Styles */
  unlockModalBox: {
    backgroundColor: '#133A30',
    borderRadius: 24,
    padding: 22,
    width: '90%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  unlockModalIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  unlockModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  unlockModalDesc: {
    fontFamily: FONTS.tajawal,
    fontSize: 12.5,
    color: '#8A9E96',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  unlockCodeInput: {
    width: '100%',
    backgroundColor: '#0A221C',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginBottom: 10,
  },
  unlockErrorText: {
    fontFamily: FONTS.tajawal,
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
    marginBottom: 12,
  },
  unlockButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  unlockCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  unlockCancelBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unlockSubmitBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  unlockSubmitBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#0A221C',
    fontWeight: '700',
  },

  /* Gesture Tip Row */
  gestureTipRow: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  gestureTipText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    color: '#D4AF37',
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Swipeable Playlist Item Styles */
  swipeableContainer: {
    position: 'relative',
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  swipeActionDeleteFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#DC2626', // Vibrant Red background for Bin Icon
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
    elevation: 1,
  },
  swipeActionContentLeft: {
    width: 90,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionDeleteText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  swipeActionEditFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0284C7', // Refined Deep Sky Blue / Teal for Edit
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
    elevation: 1,
  },
  swipeActionContentRight: {
    width: 90,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeEditIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActionEditText: {
    fontFamily: FONTS.tajawal,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  swipeableCardFront: {
    zIndex: 5,
    elevation: 4,
    backgroundColor: '#133A30',
    borderRadius: 18,
    overflow: 'hidden',
  },

  /* Delete Confirmation Modal */
  deleteConfirmModalBox: {
    backgroundColor: '#133A30',
    borderRadius: 24,
    padding: 22,
    width: '90%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  deleteModalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalDesc: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmBtnText: {
    fontFamily: FONTS.tajawal,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

