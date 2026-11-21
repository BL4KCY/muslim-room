export type PlanTier = 'free' | 'premium';
export type VisibilityLevel = 'public' | 'friends' | 'private';
export type VoteLicenseType = 'open' | 'invited_only' | 'place_and_time';

export interface UserProfile {
  id: string;
  displayName: string;
  maskedEmail: string;
  plan: PlanTier;
  favoriteQari: string;
  visibility: VisibilityLevel;
}

export interface SurahRecitationTrack {
  id: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  englishMeaning: string;
  ayahRange: string;
  qariName: string;
  qariStyle: 'Murattal' | 'Mujawwad';
  durationFormatted: string;
  audioPreviewUrl: string;
  votesCount: number;
  hasVoted: boolean;
  suggestedBy: string;
  isCurrentlyPlaying?: boolean;
  sampleArabicVerse: string;
  sampleEnglishTranslation: string;
}

export interface MajlisEventRoom {
  id: string;
  name: string;
  subtitle: string;
  hostName: string;
  visibility: 'public' | 'private';
  voteLicense: VoteLicenseType;
  locationLabel?: string;
  radiusMeters?: number;
  activeWindowLabel?: string;
  listenersCount: number;
  isBeaconNearby?: boolean;
  queue: SurahRecitationTrack[];
}

export interface KhatmahPlaylist {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  visibility: 'public' | 'private';
  editLicense: 'owner' | 'collaborative';
  version: number;
  tracks: SurahRecitationTrack[];
}

