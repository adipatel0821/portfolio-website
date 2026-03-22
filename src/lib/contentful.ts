import { createClient } from 'contentful'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN!,
})

export interface BlogPost {
  title: string
  slug: string
  publishedDate: string
  excerpt: string
  body: any // Contentful Rich Text document
  coverImage:
    | {
        url: string
        title: string
        width: number
        height: number
      }
    | undefined
  tags: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntry(entry: any): BlogPost {
  const f = entry.fields
  const asset = f.coverImage?.fields
  return {
    title: f.title ?? '',
    slug: f.slug ?? '',
    publishedDate: f.publishedDate ?? '',
    excerpt: f.excerpt ?? '',
    body: f.body ?? null,
    coverImage: asset?.file
      ? {
          url: `https:${asset.file.url}`,
          title: asset.title ?? '',
          width: asset.file.details?.image?.width ?? 0,
          height: asset.file.details?.image?.height ?? 0,
        }
      : undefined,
    tags: Array.isArray(f.tags) ? f.tags : [],
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const response = await client.getEntries({
    content_type: 'blogPost',
    order: ['-fields.publishedDate' as any], // eslint-disable-line @typescript-eslint/no-explicit-any
    include: 1,
  })
  return response.items.map(mapEntry)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
    include: 2,
  } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  if (response.items.length === 0) return null
  return mapEntry(response.items[0])
}
