import listQuery from '../queries/list.graphql'
import { useGraphQL } from './utils/graphql'
import { transformArticleList } from './utils/schema'

const sanitize = (val: unknown): string | null =>
  val ? String(val).replace(/[^a-z0-9-]/gi, '') : null

export default defineEventHandler(async (event) => {
  const { sitecode } = useRuntimeConfig()
  const query = getQuery(event)
  const section = sanitize(query.section)
  const subsection = sanitize(query.subsection)
  const size = Math.min(Math.max(parseInt(String(query.size)) || 20, 1), 50)
  const cursor = query.cursor ? String(query.cursor) : null

  const data = await useGraphQL(listQuery, {
    siteCodes: [sitecode],
    size,
    sections: section ? [section] : undefined,
    subsections: subsection ? [subsection] : undefined,
    cursor: cursor ?? undefined
  })
  return transformArticleList(data.searchAssetsBySSTS)
})
