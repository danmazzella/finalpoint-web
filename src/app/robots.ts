import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finalpoint.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/notifications/', '/theme-preferences/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
