import { buildImageUrl } from './image'
import type {
  RawArticle,
  RawBodyItem,
  Article,
  TextBodyItem,
  UnresolvedAssetItem,
  ArticleBodyItem,
  ArticleAuthor,
  ArticleSsts,
  ArticleImage,
  ImageAssetData,
  GalleryAssetData,
  GalleryImage,
  OembedAssetData,
  VideoAssetData,
  ResolvedAsset,
  ArticleCard,
  ArticleListResponse
} from './types'

function removeClassAttributes(html: string): string {
  return html.replace(/\s+class\s*=\s*["'][^"']*["']/gi, '')
}

export function resolveAsset(id: string, raw: any): ResolvedAsset {
  switch (raw.__typename ?? raw.type) {
    case 'image': {
      const orientation = raw.orientation ?? 'horizontal'
      return {
        assetType: 'image',
        id,
        data: {
          path: buildImageUrl(raw.crops ?? [], orientation, 'inline'),
          caption: raw.caption || undefined,
          credit: raw.credit || undefined,
          orientation
        } satisfies ImageAssetData
      }
    }
    case 'gallery': {
      const coverCrop =
        raw.links?.photo?.crops?.find((c: any) => c.name === '16_9') ?? raw.links?.photo?.crops?.[0]

      const images: GalleryImage[] = (raw.links?.assets ?? [])
        .map((item: any) => {
          const img = item.asset
          if (!img?.crops?.length) return null
          return {
            id: img?.id ?? '',
            path: buildImageUrl(img.crops, img?.orientation ?? 'horizontal', 'gallery'),
            caption: item.overrides?.caption || img?.caption || undefined,
            credit: img?.credit || img?.byline || undefined
          }
        })
        .filter(Boolean) as GalleryImage[]

      const coverImage = coverCrop
        ? { path: buildImageUrl(raw.links.photo.crops) }
        : images[0]
          ? { path: images[0].path }
          : undefined

      return {
        assetType: 'gallery',
        id,
        data: {
          headline: raw.title ?? raw.headline ?? '',
          coverImage,
          count: images.length,
          images
        } satisfies GalleryAssetData
      }
    }
    case 'oembed': {
      return {
        assetType: 'oembed',
        id,
        data: {
          html: raw.html ?? '',
          oembedType: raw.oembedType ?? '',
          providerName: raw.providerName ?? ''
        } satisfies OembedAssetData
      }
    }
    case 'video': {
      return {
        assetType: 'video',
        id,
        data: {
          headline: raw.headline || raw.title || undefined,
          thumbnail: raw.thumbnail || undefined,
          hlsURL: raw.hlsURL || undefined
        } satisfies VideoAssetData
      }
    }
    default:
      return { assetType: 'unknown', id, data: null }
  }
}

function processBodyItems(bodyItems: RawBodyItem[]): ArticleBodyItem[] {
  return bodyItems.map((item): ArticleBodyItem => {
    if (item.type === 'text') {
      return {
        type: 'text',
        value: removeClassAttributes(item.value)
      } satisfies TextBodyItem
    }
    return { type: 'asset', id: item.value } satisfies UnresolvedAssetItem
  })
}

function transformArticle(rawArticle: RawArticle): Article {
  const authors: ArticleAuthor[] =
    rawArticle.isBylineOverridden && rawArticle.bylineOverrideV2
      ? [{ contributorId: '', byline: rawArticle.bylineOverrideV2, profileUrl: '' }]
      : rawArticle.contributors.map((c) => ({
          contributorId: c.contributor.id,
          byline: c.contributor.byline,
          profileUrl: c.contributor.profileUrl
        }))

  const ssts: ArticleSsts = {
    section: rawArticle.ssts.section,
    subsection: rawArticle.ssts.subsection,
    topic: rawArticle.ssts.topic,
    subtopic: rawArticle.ssts.subtopic
  }

  const featuredImage: ArticleImage | undefined = rawArticle.links.photo
    ? {
        id: rawArticle.links.photoId,
        crops: rawArticle.links.photo.crops
          .filter((crop) => crop.name === '16_9' || crop.name === '4_3')
          .map((crop) => ({
            ...crop,
            path: buildImageUrl(rawArticle.links.photo!.crops, 'horizontal', 'inline')
          }))
      }
    : undefined

  return {
    headline: rawArticle.headline,
    subHead: rawArticle.subHead,
    featuredImage,
    publishDate: rawArticle.initialPublishDate,
    updateDate: rawArticle.updateDate,
    authors,
    ssts,
    body: processBodyItems(rawArticle.contentBody ?? [])
  }
}

export function safeTransformArticle(rawData: unknown): Article | null {
  try {
    const requiredFields = [
      'id',
      'headline',
      'initialPublishDate',
      'updateDate',
      'contributors',
      'ssts'
    ]
    const data = rawData as Record<string, unknown>
    if (!requiredFields.every((f) => f in data && data[f] !== undefined)) {
      console.error('Invalid article data: missing required fields')
      return null
    }
    return transformArticle(rawData as RawArticle)
  } catch (error) {
    console.error('Error transforming article:', error)
    return null
  }
}

export function transformArticleCard(raw: any): ArticleCard {
  const authors: ArticleAuthor[] = (raw.contributors ?? [])
    .map((c: any) => ({
      contributorId: c.contributorId,
      byline: c.contributor?.byline ?? '',
      profileUrl: c.contributor?.profileUrl ?? ''
    }))
    .filter((a: ArticleAuthor) => a.byline)

  return {
    id: raw.id,
    headline: raw.headline,
    promoBrief: raw.promoBrief ?? '',
    publishDate: raw.initialPublishDate,
    updateDate: raw.updateDate,
    ssts: {
      section: raw.ssts?.section ?? '',
      subsection: raw.ssts?.subsection ?? '',
      topic: raw.ssts?.topic ?? '',
      subtopic: raw.ssts?.subtopic ?? ''
    },
    authors,
    featuredImage: raw.links?.photo?.crops?.length
      ? { path: buildImageUrl(raw.links.photo.crops) }
      : undefined
  }
}

export function transformArticleList(raw: any): ArticleListResponse {
  return {
    articles: (raw.assets ?? []).map(transformArticleCard),
    cursor: raw.cursor ?? null,
    numResults: raw.numResults ?? 0
  }
}
