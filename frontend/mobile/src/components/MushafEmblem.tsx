import React from 'react';
import { View, StyleSheet } from 'react-native';
import { QuranKareemSvg } from './QuranKareemSvg';

interface MushafEmblemProps {
  size?: 'normal' | 'compact';
}

export const MushafEmblem: React.FC<MushafEmblemProps> = ({ size = 'normal' }) => {
  const isCompact = size === 'compact';
  const scale = isCompact ? 0.55 : 1;

  return (
    <View style={[styles.wrapper, { width: 62 * scale, height: 74 * scale }]}>
      {/* Outer Gold Cover */}
      <View
        style={[
          styles.cover,
          {
            width: 54 * scale,
            height: 62 * scale,
            borderRadius: 7 * scale,
            borderWidth: 1.5 * scale,
          },
        ]}
      >
        {/* Inner Dark Emerald Frame */}
        <View
          style={[
            styles.innerFrame,
            {
              width: 44 * scale,
              height: 50 * scale,
              borderRadius: 4 * scale,
              borderWidth: 1.2 * scale,
            },
          ]}
        >
          {/* Authentic Quran_Kareem.svg Calligraphy in the Middle */}
          <QuranKareemSvg
            size={30 * scale}
            color="#0A221C"
          />
        </View>
      </View>

      {/* Mushaf Book Base (Curved pages rim) */}
      <View
        style={[
          styles.pagesBase,
          {
            width: 50 * scale,
            height: 7 * scale,
            bottom: 4 * scale,
            borderWidth: 1.2 * scale,
            borderBottomLeftRadius: 5 * scale,
            borderBottomRightRadius: 5 * scale,
          },
        ]}
      />

      {/* Gold Bookmark Ribbon */}
      <View
        style={[
          styles.ribbon,
          {
            width: 8 * scale,
            height: 13 * scale,
            bottom: -3 * scale,
            left: 17 * scale,
          },
        ]}
      >
        <View
          style={[
            styles.ribbonNotch,
            {
              borderLeftWidth: 4 * scale,
              borderRightWidth: 4 * scale,
              borderBottomWidth: 4 * scale,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cover: {
    backgroundColor: '#D4AF37',
    borderColor: '#FFF3C4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  innerFrame: {
    borderColor: '#0A221C',
    backgroundColor: 'rgba(255, 243, 196, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagesBase: {
    position: 'absolute',
    backgroundColor: '#0A221C',
    borderColor: '#E5C158',
  },
  ribbon: {
    position: 'absolute',
    backgroundColor: '#E5C158',
    overflow: 'hidden',
  },
  ribbonNotch: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0A221C',
  },
});

