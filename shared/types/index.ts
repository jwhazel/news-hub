// Raw article data interfaces (from the API)
export interface RawContributor {
  id: string
  name: string
  contributor: {
    id: string
    bio: string
    expandedByline: string
    byline: string
    email: string
    twitterHandle: string
    facebookUrl: string
    instagramUrl: string
    firstName: string
    lastName: string
    reporterBioTitle: string
    profileImageId: string
    profileUrl: string
    profileImage?: {
      id: string
      crops: Array<{
        name: string
        path: string
        height: number
        width: number
      }>
      credit: string
    }
  }
}

export interface RawSsts {
  section: string
  subsection: string
  topic: string
  subtopic: string
  taxonomyEntityDisplayName: string
}

export interface RawBodyItem {
  type: 'text' | 'asset'
  value: string
}

export interface RawAssetGroup {
  siteCode: string
}

export interface RawPageURL {
  long: string
}

export interface RawTag {
  id: string
  isPrimary: boolean
  name: string
  type: string
  tag: {
    attributes: {
      legalDisclaimer: string[]
      legacyIdentifiers: string[]
    }
  }
}

export interface RawLinks {
  assetIds: Array<{
    id: string
    overrides: {
      caption: string
    }
  }>
  photoId: string
  photo: {
    crops: Array<{
      name: string
      path: string
      height?: number
      width?: number
    }>
  }
}

export interface RawExclusion {
  adTargeting: {
    categoryvalue: string[]
  }
}

// Complete raw article interface
export interface RawArticle {
  id: string
  headline: string
  bigHeadline: string
  type: string
  authoringTypeCode: string
  shortHeadline: string
  adsEnabled: boolean
  autofragment: null | string
  assetGroup: RawAssetGroup
  excludeFromMobile: boolean
  byline: string
  isBylineOverridden: boolean
  bylineOverrideV2: string
  publication: string
  contributors: RawContributor[]
  keywords: string
  contentProtectionState: string
  contentSourceCode: string
  readerCommentsDisabled: boolean
  awsPath: string
  initialPublishDate: string
  publishDate: string
  updateDate: string
  expirationDate: string
  promoBrief: string
  pageURL: RawPageURL
  propertyName: string
  propertyDisplayName: string
  propertyId: string
  series: string
  source: string
  statusName: string
  assetDocumentData: string
  exclusion: RawExclusion
  ssts: RawSsts
  tags: RawTag[]
  links: RawLinks
  storyHighlights: string[]
  subHead: string
  contentBody: RawBodyItem[]
  layoutPriorityAssetId: string
  shortMobileURL: string
  canonicalURL: string
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
  oembedType: string
  providerName: string
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
  contributorId: string
  byline: string
  profileUrl: string
}

export interface ArticleSsts {
  section: string
  subsection: string
  topic: string
  subtopic: string
}

export interface ArticleTag {
  id: string
  name: string
  isPrimary: boolean
}

export interface ArticleImage {
  id: string
  crops: Array<{
    name: string
    path: string
    height?: number
    width?: number
  }>
}

// Final transformed article schema
export interface Article {
  headline: string
  subHead: string
  publishDate: string
  updateDate: string
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
  updateDate: string
  ssts: ArticleSsts
  authors: ArticleAuthor[]
  featuredImage?: { path: string }
}

export interface ArticleListResponse {
  articles: ArticleCard[]
  cursor: string | null
  numResults: number
}

export interface GalleryResponse {
  headline: string
  images: GalleryImage[]
}

// Type guards and utility types
export type ContentProtectionState = 'free' | 'premium' | 'subscriber'
export type ArticleStatus = 'published' | 'draft' | 'archived'
export type BodyItemType = 'text' | 'asset'
