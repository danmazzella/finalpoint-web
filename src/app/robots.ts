import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finalpoint.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/scoring', '/apps', '/privacy', '/terms'],
        disallow: [
          '/admin/',
          '/dashboard',
          '/leagues',
          '/picks',
          '/community-picks',
          '/platform-standings',
          '/stats',
          '/info',
          '/profile/',
          '/notifications/',
          '/theme-preferences/',
          '/social',
          '/chat/',
          '/join',
          '/joinleague/',
          '/share/',
          '/login',
          '/signup',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
