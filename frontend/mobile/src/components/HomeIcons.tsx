import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.75" />
    <Path d="M16 16L20.5 20.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </Svg>
);

export const CommunityIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8.5" r="3.5" stroke={color} strokeWidth="1.6" />
    <Path
      d="M3 19.5C3 16.5 5.7 14.5 9 14.5C12.3 14.5 15 16.5 15 19.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M15.5 6.2C16.6 6.7 17.5 7.7 17.5 9C17.5 10.3 16.6 11.3 15.5 11.8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M17.5 14.8C19.5 15.6 21 17.3 21 19.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const PlayShortcutIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" />
    <Polygon points="10,8.5 15.5,12 10,15.5" fill={color} />
  </Svg>
);

export const NavHomeIcon: React.FC<IconProps> = ({ size = 22, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 10.5L12 3.5L20.5 10.5V19.5C20.5 20.3 19.8 21 19 21H14.5V15H9.5V21H5C4.2 21 3.5 20.3 3.5 19.5V10.5Z"
      stroke={color}
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
  </Svg>
);

export const NavPlaylistIcon: React.FC<IconProps> = ({ size = 22, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6.5H16.5M4 12H13M4 17.5H11" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <Path d="M16 13.5V19.5L20.5 16.5L16 13.5Z" fill={color} />
  </Svg>
);

export const NavCommunityIcon: React.FC<IconProps> = ({ size = 22, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8.5" r="3.2" stroke={color} strokeWidth="1.6" />
    <Path
      d="M3.5 19C3.5 16.3 6 14.5 9 14.5C12 14.5 14.5 16.3 14.5 19"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M15 6.5C16 7 16.8 8 16.8 9.2C16.8 10.4 16 11.4 15 11.9"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M17 14.8C18.8 15.6 20.2 17.1 20.5 19"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const NavProfileIcon: React.FC<IconProps> = ({ size = 22, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3.8" stroke={color} strokeWidth="1.65" />
    <Path
      d="M5 19.5C5 16.5 8.1 14.2 12 14.2C15.9 14.2 19 16.5 19 19.5"
      stroke={color}
      strokeWidth="1.65"
      strokeLinecap="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 18, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5L16 12L9 19"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 13, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <Path d="M12 7.5V12L15 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const UserAvatarBadge: React.FC<{ size?: number }> = ({ size = 46 }) => (
  <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    {/* Outer Gold Ring */}
    <Circle cx="22" cy="22" r="21" stroke="#D4AF37" strokeWidth="1.8" />
    {/* Inner Dark Emerald Background */}
    <Circle cx="22" cy="22" r="19.8" fill="#143A30" />
    {/* White Taqiyah/Kufi */}
    <Path
      d="M15 17C15 12.5 18 10.5 22 10.5C26 10.5 29 12.5 29 17C29 17.5 28.5 18 28 18H16C15.5 18 15 17.5 15 17Z"
      fill="#FFFFFF"
    />
    {/* Face */}
    <Circle cx="22" cy="20.5" r="5.8" fill="#F0C7A6" />
    <Circle cx="15.8" cy="20.5" r="1.3" fill="#E2B38F" />
    <Circle cx="28.2" cy="20.5" r="1.3" fill="#E2B38F" />
    {/* Trimmed Beard */}
    <Path
      d="M16.5 21C16.5 25 19 27 22 27C25 27 27.5 25 27.5 21C27.5 23 25.5 26.2 22 26.2C18.5 26.2 16.5 23 16.5 21Z"
      fill="#3D2E24"
    />
    {/* Neck */}
    <Path d="M20 25.5H24V28.5H20V25.5Z" fill="#F0C7A6" />
    {/* Robe/Thobe Shoulders */}
    <Path
      d="M10.5 39C10.5 32 15 28.5 22 28.5C29 28.5 33.5 32 33.5 39H10.5Z"
      fill="#EDE6D8"
    />
    {/* Subtle Gold Collar */}
    <Path
      d="M20 28.5L22 31.5L24 28.5"
      stroke="#D4AF37"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FolderIcon: React.FC<IconProps> = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C10.1162 5 10.625 5.21071 11 5.58579L12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PodcastIcon: React.FC<IconProps> = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="11" r="2.5" stroke={color} strokeWidth="1.6" />
    <Path d="M12 18V21M8 21H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M7.75 6.75C5.4 9.1 5.4 12.9 7.75 15.25" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M16.25 6.75C18.6 9.1 18.6 12.9 16.25 15.25" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const ThreeDotsIcon: React.FC<IconProps> = ({ size = 20, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.8" fill={color} />
    <Circle cx="12" cy="12" r="1.8" fill={color} />
    <Circle cx="12" cy="19" r="1.8" fill={color} />
  </Svg>
);

export const QuranBookIcon: React.FC<IconProps> = ({ size = 22, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5V6.5C4 5.4 4.9 4.5 6 4.5H18C19.1 4.5 20 5.4 20 6.5V19.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M4 19.5C4 18.4 4.9 17.5 6 17.5H20V20.5H6C4.9 20.5 4 19.6 4 19.5Z"
      stroke={color}
      strokeWidth="1.6"
    />
    <Path d="M12 4.5V17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M8 8.5H10M8 12.5H10M14 8.5H16M14 12.5H16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </Svg>
);

export const StarFavoriteIcon: React.FC<IconProps> = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.5L14.7 9.1L20.8 9.9L16.4 14.2L17.4 20.3L12 17.4L6.6 20.3L7.6 14.2L3.2 9.9L9.3 9.1L12 3.5Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.6" />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SignOutIcon: React.FC<IconProps> = ({ size = 20, color = '#F87171' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const HeadphonesIcon: React.FC<IconProps> = ({ size = 20, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 18V12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12V18"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M2 17C2 15.34 3.34 14 5 14H6V20H5C3.34 20 2 18.66 2 17Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M22 17C22 15.34 20.66 14 19 14H18V20H19C20.66 20 22 18.66 22 17Z"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

export const ArrowBackIcon: React.FC<IconProps> = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FlameStreakIcon: React.FC<IconProps> = ({ size = 20, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C9.5 5 7 7.5 7 11.5C7 14.5 9.2 17 12 17C14.8 17 17 14.5 17 11.5C17 7.5 14.5 5 12 2Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9C10.8 10.5 9.5 12 9.5 13.5C9.5 14.8 10.6 16 12 16C13.4 16 14.5 14.8 14.5 13.5C14.5 12 13.2 10.5 12 9Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookmarkRibbonIcon: React.FC<IconProps> = ({ size = 20, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V21L12 17.5L6 21V4.5Z"
      stroke={color}
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
  </Svg>
);

export const NotificationBellIcon: React.FC<IconProps> = ({ size = 20, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16V11C18 7.69 15.31 5 12 5C8.69 5 6 7.69 6 11V16L4 18H20L18 16Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <Path
      d="M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, color = '#6B8E7C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <Path d="M3 12H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path
      d="M12 3C14.5 6 16 9 16 12C16 15 14.5 18 12 21C9.5 18 8 15 8 12C8 9 9.5 6 12 3Z"
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

export const SealCheckIcon: React.FC<IconProps> = ({ size = 18, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.5 4.5L18 4L18.8 7.5L22 9.5L21 13L23 16L20 18L19.5 21.5L16 21L13.5 23.5L10.5 21L7 21.5L6.5 18L3.5 16L5.5 13L4.5 9.5L7.7 7.5L8.5 4L12 4.5L12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <Path d="M9 12.5L11 14.5L15.5 9.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckSmallIcon: React.FC<IconProps> = ({ size = 18, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 18, color = '#E06D6D' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M10 11V17M14 11V17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const ExactProfileAvatar: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    {/* Outer Gold Ring */}
    <Circle cx="48" cy="48" r="46.5" stroke="#D4AF37" strokeWidth="2.5" />
    {/* Inner Light Beige Background */}
    <Circle cx="48" cy="48" r="41.5" fill="#F4EFE6" />

    {/* Friendly Young Reciter Illustration */}
    {/* Neck */}
    <Path d="M43 56H53V64H43V56Z" fill="#F3C3A6" />

    {/* Olive / Grey Collared Thobe */}
    <Path
      d="M26 84C26 71 33 64 48 64C63 64 70 71 70 84H26Z"
      fill="#6B6E5B"
    />
    {/* Thobe Collar Lines */}
    <Path d="M44 64V76" stroke="#4F5241" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M52 64V76" stroke="#4F5241" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M48 65L48 84" stroke="#4F5241" strokeWidth="1.4" strokeLinecap="round" />

    {/* Ears */}
    <Circle cx="35" cy="48" r="3.2" fill="#EBB495" />
    <Circle cx="61" cy="48" r="3.2" fill="#EBB495" />

    {/* Face */}
    <Circle cx="48" cy="48" r="13" fill="#F5C7A9" />

    {/* Hair Under Kufi */}
    <Path
      d="M36 43C36 40 40 37 48 37C56 37 60 40 60 43C60 45 58 46 56 46C53 46 52 44 48 44C44 44 43 46 40 46C38 46 36 45 36 43Z"
      fill="#3A2D23"
    />

    {/* Olive / Charcoal Kufi Cap */}
    <Path
      d="M34 41C34 31 40 27 48 27C56 27 62 31 62 41C62 42 61 42.5 60 42.5H36C35 42.5 34 42 34 41Z"
      fill="#595A4B"
    />
    <Path
      d="M34 41H62"
      stroke="#454639"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Trimmed Jaw Beard */}
    <Path
      d="M38 49C38 57 43 61 48 61C53 61 58 49 58 49C58 54 53 60 48 60C43 60 38 54 38 49Z"
      fill="#3A2D23"
    />
    {/* Small Chin Goatee */}
    <Circle cx="48" cy="56" r="2.2" fill="#3A2D23" />

    {/* Eyes & Eyebrows */}
    <Path d="M41 43C42 42.2 44 42.2 45 43" stroke="#3A2D23" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M51 43C52 42.2 54 42.2 55 43" stroke="#3A2D23" strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="43" cy="47" r="1.5" fill="#28221D" />
    <Circle cx="53" cy="47" r="1.5" fill="#28221D" />

    {/* Nose */}
    <Path d="M48 46V50L49 51" stroke="#DCA282" strokeWidth="1.4" strokeLinecap="round" />

    {/* Gentle Friendly Smile */}
    <Path
      d="M45 53.5C46.5 55 49.5 55 51 53.5"
      stroke="#884935"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

export const LogoutIcon = SignOutIcon;

export const PlusIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, color = '#0A221C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5V19L19 12L8 5Z" fill={color} />
  </Svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 20, color = '#0A221C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 5H10V19H6V5ZM14 5H18V19H14V5Z" fill={color} />
  </Svg>
);

export const ShuffleIcon: React.FC<IconProps> = ({ size = 18, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16 3H21V8M4 20L21 3M21 16V21H16M15 15L21 21M4 4L9 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SkipNextIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4L15 12L5 20V4ZM19 5V19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SkipPrevIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12L19 4V20ZM5 19V5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HeartFilledIcon: React.FC<IconProps> = ({ size = 18, color = '#E06D6D' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      fill={color}
    />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 16, color = '#8A9E96' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const KeyIcon: React.FC<IconProps> = ({ size = 16, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 2L14 9M17 6L19 8M15 8L17 10M11 12C9.34315 12 8 13.3431 8 15C8 16.6569 9.34315 18 11 18C12.6569 18 14 16.6569 14 15C14 13.3431 12.6569 12 11 12ZM11 12L3 20V22H5L8 19V17H10L11 16"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShareIcon: React.FC<IconProps> = ({ size = 16, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.75" />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.75" />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.75" />
    <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="1.75" />
  </Svg>
);

export const EditPencilIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const VoteArrowUpIcon: React.FC<IconProps> = ({ size = 18, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12L12 5L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

