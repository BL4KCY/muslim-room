import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Quran Room — Al-Majlis Live Recitation & Collaborative Khatmah',
  description: 'Read and listen to the Holy Quran together in Moroccan sanctuary live audio rooms',
  icons: {
    icon: '/Quran_Kareem.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@500;600;700;800&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

