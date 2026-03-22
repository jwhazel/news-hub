import { useGraphQL } from '../utils/graphql'
import { resolveAsset } from '../utils/schema'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string }

  if (!id) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Asset ID is required' }))
  }

  const query = `{
  asset(id: "${id}") {
    id
    headline
    type
    authoringTypeCode
    shortHeadline
    adsEnabled
    assetGroup {
      URL
      id
      logoURL
      name
      siteCode
      siteId
      siteName
      sstsId
      type
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
        byline
        profileImageId
      }
    }
    keywords
    contentProtectionState
    contentSourceCode
    awsPath
    initialPublishDate
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
      dateTagged
      id
      isPrimary
      name
      parentId
      path
      relevanceScore
      taggingStatus
      topicType
      type
    }
    type
      links {
        photo {
          ... on image {
            crops {
              name
              path
            }
          }
        }
        assets {
          id
          overrides {
            frontHeadline
          }
          asset {
            headline
            type
          }
        }
      }
    storyHighlights
      ...on text {
      contentBody {
       type
       value
      }
      layoutPriorityAssetId
      shortMobileURL
      canonicalURL
      }
      ... on text {
      subHead
      }
      ...on image {
      imageURL: URL {
        absolute
        publish
      }
      crops {
        name
        path
        height
        width
      }
      orientation
      caption
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
      ...on gallery {
      title
      links {
        assets {
        overrides {
          caption
        }
        asset {
          id
          ... on image {
            imageURL: URL {
              absolute
              publish
            }
            crops {
              name
              path
              height
              width
            }
            orientation
            caption
            bylineOverrideV2
            byline
            credit
          }
        }
        }
      }
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
`

  const { asset } = await useGraphQL(query)
  return resolveAsset(asset.id, asset)
})
