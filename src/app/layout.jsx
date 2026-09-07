import AppProviders from './providers';
import '../styles/style.css';
import AppLayout from '../features/applayout';
import Script from 'next/script';
import LocalFont from 'next/font/local';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getLatestAnimation } from '@lib/queries/getLatestAnimation';

const geistSans = LocalFont({
  src: '../../public/fonts/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = LocalFont({
  src: '../../public/fonts/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  preload: false,
});


const aktivGrotesk = LocalFont({
  src: [
    {
      path: '../../public/fonts/AktivGroteskCorp-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AktivGroteskCorp-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-aktiv',
});


const shadowsIntoLight = LocalFont({
  src: '../../public/fonts/ShadowsIntoLight_Regular.woff2',
  variable: '--font-handwritten',
  weight: '400',
});

export const metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://annnimate.com'
      : 'http://localhost:3000'
  ),
  title: 'Annnimate',
  description:
    'Annnimate is a production-ready GSAP component library for React, Vue and HTML, built to the standard used for real brands.',
  keywords: [
    'Annnimate',
    'GSAP components',
    'React animation library',
    'Vue animation library',
    'web animation',
    'GSAP React',
  ],
  openGraph: {
    title: 'Annnimate',
    description:
      'Production-ready GSAP components for React, Vue and HTML, built to the standard used for real brands.',
    type: 'website',
    siteName: 'Annnimate',
    url: 'https://annnimate.com',
    images: [
      {
        url: '/images/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Annnimate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annnimate',
    description:
      'Production-ready GSAP components for React, Vue and HTML, at Annnimate.',
    images: ['/images/og-image.jpeg'],
  },
};

export default async function RootLayout({ children }) {
  const latestAnimation = await getLatestAnimation();
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://annnimate.com/#website',
    url: 'https://annnimate.com',
    name: 'Annnimate',
    inLanguage: 'en',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://annnimate.com/#organization',
    name: 'Annnimate',
    url: 'https://annnimate.com',
    logo: 'https://annnimate.com/images/og-image.jpeg',
  };

  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': 'https://annnimate.com/#navigation',
    name: 'Annnimate Navigation',
    url: 'https://annnimate.com',
    hasPart: [
      { '@type': 'WebPage', name: 'Home', url: 'https://annnimate.com/' },
      { '@type': 'WebPage', name: 'Pricing', url: 'https://annnimate.com/pricing' },
      { '@type': 'WebPage', name: 'Animations', url: 'https://annnimate.com/animations' },
    ],
  };

  const themeScript = `
    (function(){
      try {
        var t = localStorage.getItem('theme');
        if (t) {
          document.documentElement.setAttribute('data-theme', t);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch(e) {}
    })()
  `;

  return (
    <html
      lang="en"
      className={`${aktivGrotesk.variable} ${geistSans.variable} ${geistMono.variable} ${shadowsIntoLight.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://eu-assets.i.posthog.com" />
        <link rel="stylesheet" href="https://use.typekit.net/tdy7azi.css" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body data-transition-phase="idle">
        <AppProviders>
          <AppLayout latestAnimation={latestAnimation}>
            {children}
            <SpeedInsights />
          </AppLayout>
        </AppProviders>

        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="navigation-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
        />
      </body>
    </html>
  );
}
