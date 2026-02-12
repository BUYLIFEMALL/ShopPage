# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered Korean e-commerce product detail page (상세페이지) generator. Users input product images, description, and specifications; Claude API generates a complete, animated HTML detail page (쿠팡/스마트스토어 style) with optional long-form PNG export.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint check
```

## Architecture

**Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Claude API (claude-sonnet-4-5-20250929) · Puppeteer

**Data flow**:
1. User fills `ProductForm` → images converted to base64 client-side (`lib/image-utils.ts`)
2. POST `/api/generate` → `lib/prompt-builder.ts` builds multimodal Claude prompt → Claude returns full HTML string
3. HTML stored in-memory (`lib/store.ts`, UUID key, 1hr TTL) → user redirected to `/preview/[id]`
4. Preview page renders HTML in sandboxed `<iframe>` (`PreviewFrame`)
5. Optional PNG export: POST `/api/export-image` → Puppeteer renders HTML → returns full-page PNG

**Key files**:
- `lib/prompt-builder.ts` — Core: system + user prompts that determine output quality. Most iteration-sensitive file.
- `app/api/generate/route.ts` — Claude API call with multimodal image blocks + `maxDuration=60`
- `app/api/export-image/route.ts` — Puppeteer screenshot (width: 600px, fullPage, deviceScaleFactor: 2)
- `lib/store.ts` — Module-level `Map<string, {html, createdAt}>` (swap for Redis in production)
- `types/product.ts` — All TypeScript interfaces (`ProductInput`, `UploadedImage`, `Specification`, etc.)

## Environment

```
ANTHROPIC_API_KEY=sk-ant-...   # Required — get from console.anthropic.com
```

Copy `.env.example` to `.env.local` and fill in the API key.

## Important Constraints

- Image uploads: max 5 images, 5MB each, JPEG/PNG/WebP only (validated in `lib/image-utils.ts`)
- In-memory store resets on server restart — pages expire after 1 hour
- Puppeteer requires Chromium; on Windows local dev this is bundled with `puppeteer`. For deployment, use `@sparticuz/chromium` + `puppeteer-core`
- Claude prompt instructs output of raw HTML only (no markdown). If Claude wraps in code blocks, strip them in `app/api/generate/route.ts`

## 쿠킹요소 (Hook Elements)

The prompt in `lib/prompt-builder.ts` instructs Claude to include 8 mandatory sections:
1. Hero + emotional headline
2. Urgency banner with countdown timer
3. Key feature cards with emoji icons + scroll animation
4. Before/After comparison
5. Social proof with count-up number animation
6. Product photo gallery (all uploaded images)
7. Specifications table
8. CTA buttons (구매하기 / 장바구니)
