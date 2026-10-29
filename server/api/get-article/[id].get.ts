import articleQuery from '../../queries/article.graphql'
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

  const { asset } = await useGraphQL(articleQuery, { id })
  return safeTransformArticle(asset)
})
