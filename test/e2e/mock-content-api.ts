import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { article, assets, author, card } from '../fixtures/content-api'

// Union of the variables used across server/queries/*.graphql
export interface Variables {
  id?: string
  cursor?: string
  parameters?: string
  withProfile?: boolean
  [name: string]: unknown
}

export interface RecordedRequest {
  operation: string
  query: string
  variables: Variables
  headers: Record<string, string | string[] | undefined>
}

// Responds by GraphQL operation name (query Front, query List, ...) from server/queries/*.graphql
const handlers: Record<string, (vars: Variables) => unknown> = {
  Front: ({ id }) => ({
    front:
      id === 'section-front_TEST_missing'
        ? null
        : {
            layoutModules: [
              { moduleName: 'top-stories', totalContents: 1, contents: [{ asset: card('1') }] },
              {
                moduleName: 'content-list',
                totalContents: 3,
                contents: [
                  { asset: card('1') },
                  { asset: card('2') },
                  // Non-text assets are filtered out of fronts
                  { asset: card('3', { type: 'video' }) }
                ]
              }
            ]
          }
  }),
  List: ({ cursor }) => ({
    searchAssetsBySSTS: cursor
      ? { numResults: 3, cursor: null, assets: [card('3')] }
      : { numResults: 3, cursor: 'list-page-2', assets: [card('1'), card('2')] }
  }),
  Search: ({ parameters }) => ({
    response: {
      numResults: 1,
      cursor: null,
      assets: [card('9', { headline: `Result for ${JSON.parse(parameters!).query}` })]
    }
  }),
  Article: ({ id }) => ({ asset: id === article.id ? article : null }),
  Asset: ({ id }) => ({ asset: assets[id!] ?? null }),
  Author: ({ id, cursor, withProfile }) => ({
    // @include(if: $withProfile) omits the field entirely when false
    ...(withProfile ? { contributor: id === author.id ? author : null } : {}),
    searchAssetsByContributorIDs:
      id !== author.id
        ? { numResults: 0, cursor: null, assets: [] }
        : cursor
          ? { numResults: 3, cursor: null, assets: [card('3')] }
          : { numResults: 3, cursor: 'author-page-2', assets: [card('1'), card('2')] }
  })
}

export async function startMockContentApi() {
  const requests: RecordedRequest[] = []

  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    const query = url.searchParams.get('query') ?? ''
    const variables = JSON.parse(url.searchParams.get('variables') ?? '{}')
    const operation = query.match(/^query (\w+)/)?.[1] ?? ''
    requests.push({ operation, query, variables, headers: req.headers })

    res.setHeader('content-type', 'application/json')
    const handler = handlers[operation]
    res.end(
      JSON.stringify(
        handler
          ? { data: handler(variables) }
          : { errors: [{ message: `Mock has no handler for "${operation}"` }] }
      )
    )
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}/assets`,
    requests,
    /** Requests for one operation, e.g. lastRequest('Author') */
    lastRequest: (operation: string) => requests.findLast((r) => r.operation === operation),
    close: () =>
      new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
  }
}
