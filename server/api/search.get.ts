import { useGraphQL } from './utils/graphql'
import { transformArticleCard } from './utils/schema'

export default defineEventHandler(async (event) => {
  const { sitecode } = useRuntimeConfig()
  const query = getQuery(event)
  const q = query.q ? String(query.q).trim() : null
  const size = Math.min(Math.max(parseInt(String(query.size)) || 20, 1), 50)
  const cursor = query.cursor ? String(query.cursor) : null

  if (!q) {
    return { articles: [], cursor: null, numResults: 0 }
  }

  const params = JSON.stringify({
    query: q,
    size,
    site_codes: [sitecode],
    types: ['text', 'gallery', 'video'],
    ...(cursor ? { cursor } : {})
  })

  const gqlQuery = `{
    response: searchAssets(template: "asset_keyword_by_types", parameters: ${JSON.stringify(params)}) {
      cursor
      numResults
      assets {
        id
        headline
        type
        initialPublishDate
        updateDate
        promoBrief
        ssts { section subsection topic }
        contributors {
          ...on BaseContributors {
            contributorId
            contributor { byline profileUrl }
          }
        }
        links {
          photo {
            ...on image { crops { name path width height } }
          }
        }
      }
    }
  }`

  const data = await useGraphQL(gqlQuery)
  const response = data.response

  return {
    articles: (response?.assets ?? []).map(transformArticleCard),
    cursor: response?.cursor ?? null,
    numResults: response?.numResults ?? 0
  }
})
