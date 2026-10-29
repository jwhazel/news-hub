import authorQuery from '../../queries/author.graphql'
import { useGraphQL } from '../utils/graphql'
import { transformArticleList, transformAuthor } from '../utils/schema'
import type { AuthorResponse } from '#shared/types'

export default defineEventHandler(async (event): Promise<AuthorResponse> => {
  const { sitecode } = useRuntimeConfig()
  const id = String(event.context.params?.id ?? '').replace(/[^a-z0-9-]/gi, '')
  const query = getQuery(event)
  const size = Math.min(Math.max(parseInt(String(query.size)) || 20, 1), 50)
  const cursor = query.cursor ? String(query.cursor) : null

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Author ID is required' })
  }

  // The profile is only needed for the first page; "load more" requests skip it
  const data = await useGraphQL(authorQuery, {
    id,
    siteCodes: [sitecode],
    size,
    cursor: cursor ?? undefined,
    withProfile: !cursor
  })

  if (!cursor && !data.contributor) {
    throw createError({ statusCode: 404, statusMessage: 'Author not found' })
  }

  return {
    author: data.contributor ? transformAuthor(data.contributor) : null,
    ...transformArticleList(data.searchAssetsByContributorIDs)
  }
})
