# Portfolio Website — Project Documentation

**Author:** Aditya Patel
**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Framer Motion · Contentful CMS
**Deployed at:** Vercel (auto-deploy via GitHub Actions)
**Repository:** github.com/adipatel0821/portfolio-website

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Configuration Files](#4-configuration-files)
5. [Pages](#5-pages)
6. [Components](#6-components)
7. [Data Layer](#7-data-layer)
8. [CMS Integration — Contentful](#8-cms-integration--contentful)
9. [Styling System](#9-styling-system)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Environment Variables](#11-environment-variables)
12. [How to Run Locally](#12-how-to-run-locally)

---

## 1. Project Overview

A personal portfolio website for Aditya Patel, an M.S. Computer Science student at Stevens Institute of Technology specializing in Machine Learning and Data Engineering. The site showcases projects, experience, and blog posts — with a glassmorphism dark-mode design.

**Pages:**
- `/` — Home (hero, stats, services, tech marquee, CTA)
- `/about` — Background, education, timeline, values
- `/projects` — Project showcase cards
- `/blog` — Blog listing (Contentful CMS)
- `/blog/[slug]` — Individual blog post (Contentful CMS)
- `/contact` — Contact form and info

---

## 2. Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS variables |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | Inter (body), Montserrat (display) via Google Fonts |
| CMS | Contentful (blog posts) |
| Deployment | Vercel |
| CI/CD | GitHub Actions |
| Package Manager | npm |

---

## 3. Project Structure

```
portfolio-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, Navbar, ThemeProvider)
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles and CSS variables
│   │   ├── about/
│   │   │   └── page.tsx        # About page
│   │   ├── blog/
│   │   │   ├── page.tsx        # Blog listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual blog post page
│   │   ├── contact/
│   │   │   └── page.tsx        # Contact page
│   │   └── projects/
│   │       └── page.tsx        # Projects page
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── MobileSidebar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── QuickStats.tsx
│   │   ├── TechMarquee.tsx
│   │   ├── SubwayTimeline.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ContactForm.tsx
│   │   ├── ContactInfo.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── NYCSkyline.tsx
│   ├── context/
│   │   └── ThemeContext.tsx     # Dark/light mode state
│   ├── data/
│   │   ├── projects.ts         # Static project data
│   │   └── posts.ts            # (Legacy) static blog post data
│   └── lib/
│       └── contentful.ts       # Contentful SDK client + data fetching
├── .env.local                  # Local environment variables (gitignored)
├── .gitignore
├── .npmrc                      # legacy-peer-deps=true (ESLint peer fix)
├── next.config.js              # Next.js config (image domains)
├── tailwind.config.js          # Tailwind theme extensions
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS config (required by Tailwind)
└── package.json                # Dependencies and scripts
```

---

## 4. Configuration Files

### `package.json`
Defines all dependencies and npm scripts.
- `dev` — starts local dev server
- `build` — compiles production build
- `start` — runs production server
- `lint` — runs ESLint

Key dependencies: `next`, `react`, `contentful`, `@contentful/rich-text-html-renderer`, `framer-motion`, `lucide-react`
Key devDependencies: `typescript`, `tailwindcss`, `eslint@^9`, `eslint-config-next`

### `.npmrc`
```
legacy-peer-deps=true
```
Added to resolve a peer dependency conflict between `eslint@8` and `eslint-config-next@16` during Vercel deployment. Tells npm to use legacy resolution behavior.

### `next.config.js`
```js
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'images.ctfassets.net' }]
}
```
Allows `next/image` to load images from Contentful's CDN (`images.ctfassets.net`).

### `tailwind.config.js`
Extends Tailwind with:
- **Custom fonts:** `font-sans` (Inter), `font-display` (Montserrat)
- **Custom animations:** `marquee`, `marquee-reverse`, `shimmer`, `liquid`, `float`, `twinkle`, `glow-pulse`, `slide-in-right`
- Content paths cover all files under `src/`

### `tsconfig.json`
Standard Next.js TypeScript config with `@/` path alias pointing to `src/`.

### `postcss.config.js`
Required by Tailwind CSS — enables the PostCSS Tailwind and Autoprefixer plugins.

### `.gitignore`
Excludes from version control:
- `node_modules/` — dependencies
- `.next/` and `out/` — build output
- `.env`, `.env.local`, `.env.*.local` — secrets
- TypeScript build info and misc OS files

---

## 5. Pages

### `src/app/layout.tsx` — Root Layout
The root layout wraps every page. Responsibilities:
- Loads **Inter** and **Montserrat** from Google Fonts as CSS variables
- Sets global `<html>` metadata (title, description, keywords for SEO)
- Wraps the app in `ThemeProvider` for dark/light mode
- Renders the `Navbar` above all page content

### `src/app/globals.css` — Global Styles
Defines the entire design system via CSS custom properties (variables):
- **Color tokens:** `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent-primary` (cyan `#00d4ff`), `--accent-secondary` (purple `#a855f7`)
- **Glass tokens:** `--glass-bg`, `--glass-border`, `--glass-shadow`, `--navbar-bg`
- **Reusable utility classes:** `.glass-card`, `.liquid-btn`, `.tech-chip`, `.section-heading`, `.section-label`, `.accent-line`, `.gradient-text`, `.prose-custom`, `.stat-num`
- Dark and light theme values are switched by `[data-theme="dark"]` on the `<html>` element

### `src/app/page.tsx` — Home Page
Composes the homepage from smaller components:
1. **HeroSection** — full-screen animated hero
2. **QuickStats** — headline numbers bar
3. **"What I Do" grid** — 4 service cards (ML, Data Eng, Full-Stack, IoT)
4. **TechMarquee** — scrolling tech logos strip
5. **Stats row** — 4 highlight numbers (internships, projects, cloud deployments, records)
6. **CTA Banner** — call-to-action with "Get in Touch" and "View Projects" buttons
7. **Footer**

### `src/app/about/page.tsx` — About Page
Sections:
- **Highlights grid** — education, location, internship count, tech focus
- **SubwayTimeline** — career/education timeline (styled as NYC subway stops)
- **Values** — 3 numbered philosophy cards
- **Interests** — tag cloud of personal and professional interests

### `src/app/projects/page.tsx` — Projects Page
Renders all projects from `src/data/projects.ts` using the `ProjectCard` component. Projects displayed in a responsive grid.

### `src/app/blog/page.tsx` — Blog Listing
Server component. Fetches all posts from Contentful via `getAllPosts()`.
- If no posts exist: renders an `EmptyState` component
- If posts exist: renders a large `FeaturedCard` for the first post, then a 3-column `PostCard` grid for the rest
- Includes an article count badge and a CTA section at the bottom
- `revalidate = 60` — page re-fetches from Contentful every 60 seconds

### `src/app/blog/[slug]/page.tsx` — Blog Post Page
Dynamic route for individual posts. Key features:
- **`generateStaticParams`** — pre-generates slugs at build time; wrapped in `try/catch` so the build doesn't fail if the Contentful content type doesn't exist yet
- **`dynamicParams = true`** — allows on-demand rendering for slugs not pre-generated
- **`generateMetadata`** — generates SEO title, description, and Open Graph tags per post
- **Body rendering** — uses `documentToHtmlString()` from `@contentful/rich-text-html-renderer` to convert Contentful's rich text format to HTML
- **Cover image** — rendered with `next/image` for optimization
- **Related posts** — fetches all posts, filters out the current one, shows the first two
- `revalidate = 60`

### `src/app/contact/page.tsx` — Contact Page
Two-column layout:
- Left: `ContactInfo` (email, LinkedIn, GitHub, location)
- Right: `ContactForm` (name, email, message fields)

---

## 6. Components

### `Navbar.tsx`
Fixed top navigation bar. Features:
- Framer Motion slide-in animation on mount
- Transparent when at top of page; glass blur background after scrolling 28px
- Active link highlighted with an animated `motion.span` pill (shared layout animation via `layoutId="nav-pill"`)
- Desktop: horizontal nav links + ThemeToggle + "Hire Me" button
- Mobile: hamburger button that opens `MobileSidebar`

### `MobileSidebar.tsx`
Full-height slide-in drawer for mobile navigation. Animates in from the right using Framer Motion. Contains all nav links and the theme toggle.

### `HeroSection.tsx`
Full-screen hero section. Features:
- Ken Burns effect (slow zoom on background)
- Animated star/particle field (rendered on a `<canvas>`)
- `NYCSkyline` SVG as a decorative background element
- Headline with gradient text, subtitle, CTA buttons
- Floating badge showing current role/location

### `QuickStats.tsx`
Horizontal bar below the hero showing key numbers (internships, cloud platforms, projects, etc.) with animated count-up on scroll into view.

### `TechMarquee.tsx`
Two rows of continuously scrolling tech badges — one scrolling left, one right. Implemented with CSS `animation: marquee` keyframes. Includes: Python, PyTorch, TensorFlow, AWS, GCP, SQL, Docker, and more.

### `SubwayTimeline.tsx`
Vertical timeline styled as NYC subway stops. Each stop has:
- A colored station dot
- Year label
- Role/institution title
- Subtitle (degree, company, etc.)
- Animated connector lines between stops
- Keys use `${year}-${index}` to avoid duplicate key warnings when two stops share the same year

### `ProjectCard.tsx`
Card component for the projects page. Displays:
- Project title and tagline
- Tech stack as chip badges
- Color-coded accent bar
- Category tag and year
- Links to GitHub and live demo

### `ContactForm.tsx`
Client component with controlled form inputs. Fields: Name, Email, Message. Styled with glass-card background and accent focus rings.

### `ContactInfo.tsx`
Static contact details component. Displays:
- Email: `adityapatel280104@gmail.com`
- LinkedIn, GitHub links
- Location: Hoboken, NJ
- Availability note

### `ScrollReveal.tsx`
Wrapper component using Framer Motion's `useInView` hook. Animates children into view when they enter the viewport. Supports `direction` prop (`up`, `down`, `left`, `right`, `scale`) and a `delay` prop for staggered animations.

### `ThemeToggle.tsx`
Button that toggles between dark and light mode by updating `ThemeContext` state and writing to `localStorage`. Displays a sun/moon icon.

### `NYCSkyline.tsx`
Decorative SVG component rendering a simplified NYC skyline silhouette used as a background element in the hero section.

---

## 7. Data Layer

### `src/data/projects.ts`
Static array of `Project` objects. Each project has:
- `id`, `title`, `tagline`, `description`, `vision`
- `tech` — array of technology names
- `color`, `accent` — hex colors for card theming
- `github`, `live` — links
- `category`, `year`, `impact`

Projects defined:
1. Multimodal GAN — Synthetic Patient Data
2. SynMedix AI — Parallel EHR Processing
3. AMFI Mutual Fund ETL Pipeline
4. Investor Marketplace Platform
5. SHEMS — Smart Home Energy Management

### `src/data/posts.ts`
Legacy static blog post data, kept for reference. Active blog content is now served from Contentful.

### `src/context/ThemeContext.tsx`
React context providing `theme` state (`"dark"` | `"light"`) and a `toggleTheme` function. On mount, reads from `localStorage` to persist the user's preference across sessions. Sets `data-theme` attribute on `<html>` to switch CSS variable sets.

---

## 8. CMS Integration — Contentful

### `src/lib/contentful.ts`
Contentful SDK integration. Contains:

**Client** — created lazily inside each function (not at module level) so that missing environment variables don't crash the build:
```ts
function getClient() {
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN!,
  })
}
```

**`BlogPost` interface:**
```ts
interface BlogPost {
  title: string
  slug: string
  publishedDate: string   // ISO date string
  excerpt: string
  body: any               // Contentful Rich Text Document
  coverImage: { url: string; title: string; width: number; height: number } | undefined
  tags: string[]
}
```

**`getAllPosts()`** — fetches all entries of content type `blogPost`, ordered by `-fields.publishedDate` (newest first), with `include: 1` to resolve linked assets.

**`getPostBySlug(slug)`** — fetches a single post filtered by `fields.slug`, with `include: 2` to resolve nested asset references (needed for body embedded images).

**`mapEntry()`** — private helper that maps a raw Contentful entry to a clean `BlogPost` object. Prepends `https:` to Contentful's protocol-relative image URLs.

### Contentful Content Type Setup
The content type ID must be `blogPost` with these field API identifiers:

| Field | API ID | Type |
|-------|--------|------|
| Title | `title` | Short text |
| Slug | `slug` | Short text |
| Published Date | `publishedDate` | Date |
| Excerpt | `excerpt` | Short text |
| Body | `body` | Rich text |
| Cover Image | `coverImage` | Media (image) |
| Tags | `tags` | Short text, list |

---

## 9. Styling System

The design uses **glassmorphism** — frosted glass cards over dark/light gradient backgrounds.

### CSS Variables (set in `globals.css`)
| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Main page background |
| `--bg-secondary` | Alternating section background |
| `--text-primary` | Headings and primary text |
| `--text-secondary` | Body text |
| `--text-muted` | Captions, labels |
| `--accent-primary` | Cyan `#00d4ff` — primary highlight color |
| `--accent-secondary` | Purple `#a855f7` — secondary highlight |
| `--glass-bg` | Semi-transparent card background |
| `--glass-border` | Subtle card border |
| `--glass-shadow` | Card drop shadow |
| `--divider` | Section divider lines |

### Key CSS Classes
| Class | Description |
|-------|-------------|
| `.glass-card` | Frosted glass card with border and backdrop blur |
| `.liquid-btn` | Animated gradient CTA button with shimmer effect |
| `.tech-chip` | Small tag badge for tech stack items |
| `.section-heading` | Large bold display heading |
| `.section-label` | Small uppercase section category label |
| `.accent-line` | Short colored horizontal rule |
| `.gradient-text` | Cyan-to-purple animated gradient text |
| `.prose-custom` | Rich text body styling for blog posts |
| `.stat-num` | Large animated stat number style |

---

## 10. CI/CD Pipeline

### `.github/workflows/deploy.yml`

**Triggers:**
- Push to `master` branch
- `repository_dispatch` with type `contentful_publish` (Contentful webhook)
- `workflow_dispatch` (manual trigger from GitHub UI)

**Steps:**
1. `actions/checkout@v4` — clone the repo
2. `actions/setup-node@v4` — install Node 20 with npm cache
3. `npm ci` — install dependencies from lockfile
4. `npm run build` — compile Next.js production build (with Contentful env vars injected from GitHub Secrets)
5. `amondnet/vercel-action@v25` — deploy built output to Vercel production

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel Team ID (from Team Settings → General) |
| `VERCEL_PROJECT_ID` | Vercel Project ID (from Project Settings → General) |
| `CONTENTFUL_SPACE_ID` | Contentful space identifier |
| `CONTENTFUL_DELIVERY_TOKEN` | Contentful Content Delivery API token |

---

## 11. Environment Variables

### `.env.local` (local development — never committed)
```
CONTENTFUL_SPACE_ID=<your-space-id>
CONTENTFUL_DELIVERY_TOKEN=<your-delivery-token>
```

These same variables must also be set in:
- **Vercel** → Project Settings → Environment Variables (for production builds)
- **GitHub** → Repository Settings → Secrets and Variables → Actions (for CI builds)

---

## 12. How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/adipatel0821/portfolio-website.git
cd portfolio-website

# 2. Install dependencies
npm install

# 3. Create environment variables file
# Create .env.local and add your Contentful credentials:
# CONTENTFUL_SPACE_ID=your_space_id
# CONTENTFUL_DELIVERY_TOKEN=your_delivery_token

# 4. Start the development server
npm run dev
# Open http://localhost:3000

# 5. Build for production (optional)
npm run build
npm start
```

The blog pages will show an empty state if Contentful credentials are missing or if no `blogPost` content type exists — all other pages work without Contentful.
