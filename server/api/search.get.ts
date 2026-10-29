import searchQuery from '../queries/search.graphql'
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

  const parameters = JSON.stringify({
    query: q,
    size,
    site_codes: [sitecode],
    types: ['text', 'gallery', 'video'],
    ...(cursor ? { cursor } : {})
  })

  const data = await useGraphQL(searchQuery, { parameters })
  const response = data.response

  return {
    articles: (response?.assets ?? []).map(transformArticleCard),
    cursor: response?.cursor ?? null,
    numResults: response?.numResults ?? 0
  }
})
