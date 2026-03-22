import { useGraphQL } from '../utils/graphql'
import { safeTransformArticle } from '../utils/schema'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string }

  if (!id) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'Article ID is required' })
    )
  }

  const query = `{
  asset(id: "${id}") {
    id
    headline
    bigHeadline
    type
    authoringTypeCode
    shortHeadline
    adsEnabled
    ... on text {
      autofragment {
        assetID
        autoFragments {
          fragmentID
          parameters {
            key
            value
          }
        }
      }
    }
    assetGroup {
      siteCode
    }
    excludeFromMobile
    byline
    isBylineOverridden
    bylineOverrideV2
    publication
    contributors {
      id
      name
      contributor {
        id
        bio
        expandedByline
        byline
        email
        twitterHandle
        facebookUrl
        instagramUrl
        firstName
        lastName
        reporterBioTitle
        profileImageId
        profileUrl
        profileImage {
          id
          ... on image {
            crops {
              name
              path
              height
              width
            }
            credit
          }
        }
      }
    }
    keywords
    contentProtectionState
    contentSourceCode
    readerCommentsDisabled
    awsPath
    initialPublishDate
    publishDate
    updateDate
    expirationDate
    promoBrief
    pageURL {
      long
    }
    propertyName
    propertyDisplayName
    propertyId
    series
    source
    statusName
    assetDocumentData
    exclusion {
      adTargeting {
        categoryvalue
      }
    }
    ssts {
      section
      subsection
      topic
      subtopic
      taxonomyEntityDisplayName
    }
    tags {
      id
      isPrimary
      name
      type
      tag {
       attributes {
          legalDisclaimer
          legacyIdentifiers
          followIgnoreWhenPrimary
          }
       }
    }
    type
    links {
      assetIds: assets {
        id
        asset {
          type
        }
        overrides {
          caption
        }
      }
      photoId
      photo {
        ...promoImageFields
      }
    }
    storyHighlights
    ...on text {
      subHead
      contentBody {
       type
       value
      }
      layoutPriorityAssetId
      shortMobileURL
      canonicalURL
    }
    ...on oembed {
      assetId
      oembedURL: URL
      oembedType
      originalType
      html
      providerName
      width
      height
      statusName
    }
    ...on video {
      ...videoFields
    }
  }
}

fragment videoFields on video {
  id
  title
  contributors {
    name
    id
    contributor {
      byline
      profileImageId
    }
  }
  exclusion {
    adTargeting {
    categoryvalue
    }
  }
  contentSourceCode
  shortHeadline
  tags {
    name
    id
    taggingStatus
    type
    isPrimary
  }
  hlsURL
  adsEnabled
  thumbnail
  videoStill
  origin
  type
  awsPath
  byline
  isBylineOverridden
  bylineOverrideV2
  updateDate
  ssts {
    section
    subtopic
    topic
  }
  pageURL {
    long
  }
  promoBrief
  brightcoveId
  brightcoveAccountId
  links {
    photo {
      ... on image {
        crops {
          name
          path
        }
      }
    }
  }
  renditions {
    videoURL: URL
    audioOnly
    codec
    container
    displayName
    duration
    encodingRate
    height
    size
    type
    width
  }
}

fragment promoImageFields on image {
  crops {
    name
    path
  }
}
`

  const { asset } = await useGraphQL(query)
  return safeTransformArticle(asset)
})
