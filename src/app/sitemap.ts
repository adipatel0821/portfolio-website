import type { MetadataRoute } from 'next'
import { projects } from '@/data/projects'
import { getAllPosts } from '@/lib/contentful'
import { site } from '@/lib/site'

/**
 * Sitemap covering static routes, all nine case studies, and every published
 * blog post. Blog fetching is wrapped because Contentful being unreachable at
 * build time should degrade the sitemap, not fail the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/projects`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${site.url}/projects/${p.id}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await getAllPosts()
    postRoutes = posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.publishedDate ? new Date(post.publishedDate) : now,
      changeFrequency: 'yearly',
      priority: 0.6,
    }))
  } catch {
    // Contentful unreachable at build time — ship the rest of the sitemap.
  }

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
