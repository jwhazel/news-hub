import assetQuery from '../../queries/asset.graphql'
import { useGraphQL } from '../utils/graphql'
import { resolveAsset } from '../utils/schema'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string }

  if (!id) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Asset ID is required' }))
  }

  const { asset } = await useGraphQL(assetQuery, { id })
  return resolveAsset(asset.id, asset)
})
