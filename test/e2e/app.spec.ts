import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import type { Article, ArticleListResponse, AuthorResponse, ResolvedAsset } from '#shared/types'
import { startMockContentApi } from './mock-content-api'

const mock = await startMockContentApi()

// NUXT_* env vars override runtimeConfig, so the app talks to the mock instead of the real API
await setup({
  rootDir: fileURLToPath(new URL('../..', import.meta.url)),
  server: true,
  env: {
    NUXT_CONTENT_ENDPOINT: mock.url,
    NUXT_CONTENT_API_KEY: 'test-key',
    NUXT_SITECODE: 'TEST',
    NUXT_USER_AGENT: 'test-agent',
    NUXT_MEDIA_BASE_URL: 'https://media.test'
  }
})

afterAll(() => mock.close())

describe('content api requests', () => {
  it('go to the mock with API credentials', async () => {
    await $fetch('/api/get-front')
    expect(mock.lastRequest('Front')?.headers).toMatchObject({
      'x-api-key': 'test-key',
      'x-sitecode': 'TEST',
      'user-agent': 'test-agent'
    })
  })
})

describe('server api', () => {
  it('returns the text articles from the front content list', async () => {
    const front = await $fetch<ArticleListResponse>('/api/get-front?section=sports')
    expect(mock.lastRequest('Front')?.variables).toEqual({ id: 'section-front_TEST_sports' })
    expect(front.articles.map((a) => a.id)).toEqual(['1', '2'])
    expect(front.articles[0]).toMatchObject({
      headline: 'Headline 1',
      authors: [{ contributorId: '9244336002', byline: 'Ryan Black' }],
      featuredImage: {
        path: expect.stringMatching(
          /^https:\/\/media\.test\/gcdn\/.+\?crop=5624,3164,x0,y0&width=1320&height=740&format=pjpg&auto=webp$/
        )
      }
    })
  })

  it('returns an empty list for a missing front', async () => {
    const front = await $fetch<ArticleListResponse>('/api/get-front?section=missing')
    expect(front.articles).toEqual([])
  })

  it('pages through the latest list, only sending the filters that are set', async () => {
    const page1 = await $fetch<ArticleListResponse>('/api/get-list?section=news')
    expect(mock.lastRequest('List')?.variables).toEqual({
      siteCodes: ['TEST'],
      size: 20,
      sections: ['news']
    })
    expect(page1.cursor).toBe('list-page-2')

    const page2 = await $fetch<ArticleListResponse>(`/api/get-list?cursor=${page1.cursor}`)
    expect(mock.lastRequest('List')?.variables).toEqual({
      siteCodes: ['TEST'],
      size: 20,
      cursor: 'list-page-2'
    })
    expect(page2.articles.map((a) => a.id)).toEqual(['3'])
  })

  it('searches with the keyword template parameters', async () => {
    const results = await $fetch<ArticleListResponse>('/api/search?q=burgers')
    expect(JSON.parse(mock.lastRequest('Search')!.variables.parameters!)).toEqual({
      query: 'burgers',
      size: 20,
      site_codes: ['TEST'],
      types: ['text', 'gallery', 'video']
    })
    expect(results.articles[0]?.headline).toBe('Result for burgers')
  })

  it('skips the API for an empty search', async () => {
    const before = mock.requests.length
    expect(await $fetch<ArticleListResponse>('/api/search?q=')).toMatchObject({ articles: [] })
    expect(mock.requests.length).toBe(before)
  })

  it('returns an article', async () => {
    const article = await $fetch<Article>('/api/get-article/100')
    expect(article.headline).toBe('Kentucky wins exhibition in overtime')
    expect(article.body).toContainEqual({ type: 'asset', id: '200' })
  })

  it('passes ids as variables rather than query text', async () => {
    const id = '1") { id } x: asset(id: "2'
    const res = await fetch(`/api/get-article/${encodeURIComponent(id)}`)
    expect(res.status).toBe(204)
    expect(mock.lastRequest('Article')?.variables).toEqual({ id })
  })

  it('resolves each embedded asset type', async () => {
    const types: Record<string, string> = {
      200: 'image',
      201: 'gallery',
      202: 'video',
      203: 'oembed',
      204: 'unknown'
    }
    for (const [id, assetType] of Object.entries(types)) {
      const asset = await $fetch<ResolvedAsset>(`/api/get-asset/${id}`)
      expect(asset).toMatchObject({ id, assetType })
    }
  })

  it('returns an author profile with their first page of articles', async () => {
    const page1 = await $fetch<AuthorResponse>('/api/get-author/9244336002')
    expect(mock.lastRequest('Author')?.variables).toEqual({
      id: '9244336002',
      siteCodes: ['TEST'],
      size: 20,
      withProfile: true
    })
    expect(page1.author).toEqual({
      id: '9244336002',
      byline: 'Ryan Black',
      title: 'University of Kentucky sports beat reporter',
      image: expect.stringContaining('?crop=3750,3749,x562,y0&width=192&height=192')
    })
    expect(page1.articles.map((a) => a.id)).toEqual(['1', '2'])
    expect(page1.cursor).toBe('author-page-2')
  })

  it('skips the author profile when loading more', async () => {
    const page2 = await $fetch<AuthorResponse>('/api/get-author/9244336002?cursor=author-page-2')
    expect(mock.lastRequest('Author')?.variables).toMatchObject({
      cursor: 'author-page-2',
      withProfile: false
    })
    expect(page2.author).toBeNull()
    expect(page2.articles.map((a) => a.id)).toEqual(['3'])
  })

  it('returns 404 for an unknown author', async () => {
    expect((await fetch('/api/get-author/123')).status).toBe(404)
  })
})

describe('pages', () => {
  it('server-renders the home page with linked bylines', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('Headline 1')
    expect(html).toContain('href="/article/1"')
    expect(html).toContain('href="/author/9244336002"')
  })

  it('server-renders an article with its embeds', async () => {
    const html = await $fetch<string>('/article/100')
    expect(html).toContain('Kentucky wins exhibition in overtime')
    expect(html).toContain('Opening paragraph of the story.')
    expect(html).toContain('Fans fill Rupp Arena')
    expect(html).toContain('href="/author/9244336002"')
  })

  it('server-renders an author page', async () => {
    const html = await $fetch<string>('/author/9244336002')
    expect(html).toContain('Ryan Black')
    expect(html).toContain('University of Kentucky sports beat reporter')
    expect(html).toContain('Headline 2')
    expect(html).toContain('Load more')
  })

  it('shows a not-found message for an unknown author', async () => {
    const html = await $fetch<string>('/author/123')
    expect(html).toContain('Author not found.')
  })
})
