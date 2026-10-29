// Raw article data interfaces (shape of server/queries/article.graphql)
export interface RawBodyItem {
  type: 'text' | 'asset'
  value: string
}

export interface RawArticle {
  id: string
  headline: string
  initialPublishDate: string
  isBylineOverridden: boolean
  bylineOverrideV2: string
  contributors: Array<{ contributor: { id: string; byline: string } }>
  ssts: { section: string }
  links: {
    photoId: string
    photo?: {
      crops: Array<{
        name: string
        path: string
      }>
    }
  }
  subHead: string
  contentBody: RawBodyItem[]
}

// Transformed article interfaces (clean output)
export interface TextBodyItem {
  type: 'text'
  value: string
}

export interface UnresolvedAssetItem {
  type: 'asset'
  id: string
}

export type ArticleBodyItem = TextBodyItem | UnresolvedAssetItem

export interface GalleryImage {
  id: string
  path: string
  caption?: string
  credit?: string
}

export interface ImageAssetData {
  path: string
  caption?: string
  credit?: string
  orientation?: string
}

export interface GalleryAssetData {
  headline: string
  coverImage?: { path: string }
  count: number
  images: GalleryImage[]
}

export interface OembedAssetData {
  html: string
}

export interface VideoAssetData {
  headline?: string
  thumbnail?: string
  hlsURL?: string
}

export interface ResolvedAsset {
  assetType: 'image' | 'gallery' | 'oembed' | 'video' | 'unknown'
  id: string
  data: ImageAssetData | GalleryAssetData | OembedAssetData | VideoAssetData | null
}

export interface ArticleAuthor {
  // Missing for overridden bylines, which aren't tied to a contributor
  contributorId?: string
  byline: string
}

export interface ArticleSsts {
  section: string
}

export interface ArticleImage {
  id: string
  path: string
}

// Final transformed article schema
export interface Article {
  headline: string
  subHead: string
  publishDate: string
  authors: ArticleAuthor[]
  ssts: ArticleSsts
  body: ArticleBodyItem[]
  featuredImage?: ArticleImage
}

// Article card (list view — no body)
export interface ArticleCard {
  id: string
  headline: string
  promoBrief: string
  publishDate: string
  ssts: ArticleSsts
  authors: ArticleAuthor[]
  featuredImage?: { path: string }
}

export interface ArticleListResponse {
  articles: ArticleCard[]
  cursor: string | null
  numResults: number
}

export interface AuthorProfile {
  id: string
  byline: string
  title?: string
  image?: string
}

// `author` is only included on the first page (no cursor)
export interface AuthorResponse extends ArticleListResponse {
  author: AuthorProfile | null
}
