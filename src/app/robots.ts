import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // API routes are webhooks and form handlers — nothing to index.
      disallow: ['/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
