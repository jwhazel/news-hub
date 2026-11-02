import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resolveAsset,
  safeTransformArticle,
  transformArticleCard,
  transformArticleList,
  transformAuthor
} from '../../server/api/utils/schema'
import {
  buildFeaturedImageUrl,
  buildImageUrl,
  buildThumbnailUrl
} from '../../server/api/utils/image'
import { article, assets, author, card, crops } from '../fixtures/content-api'

beforeEach(() => {
  vi.stubGlobal('useRuntimeConfig', () => ({ mediaBaseUrl: 'https://media.test' }))
})

describe('transformArticleCard', () => {
  it('maps a raw asset to a card', () => {
    expect(transformArticleCard(card('1'))).toEqual({
      id: '1',
      headline: 'Headline 1',
      promoBrief: 'Promo brief 1',
      publishDate: '2026-10-28T20:00:39Z',
      ssts: { section: 'sports' },
      authors: [{ contributorId: author.id, byline: author.byline }],
      featuredImage: { path: buildFeaturedImageUrl(crops), thumbnail: buildThumbnailUrl(crops) }
    })
  })

  it('drops authors without a byline and handles missing images', () => {
    const raw = card('2', {
      contributors: [{ contributorId: '1', contributor: { byline: '' } }],
      links: {}
    })
    const result = transformArticleCard(raw)
    expect(result.authors).toEqual([])
    expect(result.featuredImage).toBeUndefined()
  })
})

describe('transformArticleList', () => {
  it('defaults the cursor and result count', () => {
    expect(transformArticleList({ assets: [card('1')] })).toMatchObject({
      cursor: null,
      numResults: 0
    })
  })
})

describe('safeTransformArticle', () => {
  it('transforms an article', () => {
    expect(safeTransformArticle(article)).toEqual({
      headline: article.headline,
      subHead: article.subHead,
      publishDate: article.initialPublishDate,
      authors: [{ contributorId: author.id, byline: author.byline }],
      ssts: { section: 'sports' },
      featuredImage: { id: '92489507007', path: buildFeaturedImageUrl(crops) },
      body: [
        // class attributes are stripped from body HTML
        { type: 'text', value: '<p>Opening paragraph of the story.</p>' },
        { type: 'asset', id: '200' },
        { type: 'text', value: '<p>Closing paragraph.</p>' }
      ]
    })
  })

  it('uses the override byline without an author link', () => {
    const result = safeTransformArticle({
      ...article,
      isBylineOverridden: true,
      bylineOverrideV2: 'Courier Journal staff'
    })
    expect(result?.authors).toEqual([{ byline: 'Courier Journal staff' }])
  })

  it('returns null for missing or incomplete articles', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(safeTransformArticle(null)).toBeNull()
    expect(safeTransformArticle({ ...article, headline: undefined })).toBeNull()
  })
})

describe('resolveAsset', () => {
  it('resolves images', () => {
    expect(resolveAsset('200', assets[200])).toEqual({
      assetType: 'image',
      id: '200',
      data: {
        path: buildImageUrl(crops),
        caption: 'Fans fill Rupp Arena',
        credit: 'Matt Stone, The C-J',
        orientation: 'horizontal'
      }
    })
  })

  it('resolves galleries, preferring plain-text caption overrides and dropping photos without crops', () => {
    expect(resolveAsset('201', assets[201])).toEqual({
      assetType: 'gallery',
      id: '201',
      data: {
        headline: 'Best photos from the game',
        coverImage: { path: buildImageUrl(crops) },
        count: 1,
        images: [
          {
            id: '210',
            path: buildImageUrl(crops, 'horizontal', 'gallery'),
            caption: "Paxton rallied area Republicans & voters' hopes.",
            credit: 'Photographer Byline'
          }
        ]
      }
    })
  })

  it('resolves videos, falling back to the title', () => {
    expect(resolveAsset('202', assets[202]).data).toEqual({
      headline: 'Postgame press conference',
      thumbnail: 'https://media.example/thumb.jpg',
      hlsURL: 'https://media.example/video.m3u8'
    })
  })

  it('resolves oembeds', () => {
    expect(resolveAsset('203', assets[203])).toEqual({
      assetType: 'oembed',
      id: '203',
      data: { html: '<blockquote class="twitter-tweet">Embedded post</blockquote>' }
    })
  })

  it('marks unsupported types as unknown', () => {
    expect(resolveAsset('204', assets[204])).toEqual({
      assetType: 'unknown',
      id: '204',
      data: null
    })
  })
})

describe('transformAuthor', () => {
  it('maps a contributor profile', () => {
    expect(transformAuthor(author)).toEqual({
      id: author.id,
      byline: author.byline,
      title: author.reporterBioTitle,
      image: expect.stringContaining('&width=192&height=192')
    })
  })

  it('omits an empty title and missing headshot', () => {
    const result = transformAuthor({ id: '1', byline: 'Staff', reporterBioTitle: '' })
    expect(result.title).toBeUndefined()
    expect(result.image).toBeUndefined()
  })
})
