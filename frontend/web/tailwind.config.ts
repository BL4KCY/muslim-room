import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          deep: '#06110e',
          DEFAULT: '#0a1b16',
          card: '#102820',
          hover: '#15352b',
        },
        gold: {
          primary: '#d4af37',
          bright: '#f0ce63',
          light: '#ffe89e',
        },
        ivory: '#f8f5ee',
        sage: '#9cb2a9',
      },
      fontFamily: {
        tajawal: ['Tajawal', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        amiri: ['Amiri', 'Traditional Arabic', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

