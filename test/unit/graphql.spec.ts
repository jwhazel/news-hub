import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGraphQL } from '../../server/api/utils/graphql'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({ json: async () => ({ data: { ok: true } }) })
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({
    contentEndpoint: 'https://api.test/assets',
    contentApiKey: 'test-key',
    sitecode: 'TEST',
    userAgent: 'test-agent'
  }))
})

const requestUrl = () => new URL(fetchMock.mock.calls[0]![0])

describe('useGraphQL', () => {
  it('sends the query and variables as GET params with API headers', async () => {
    const query = 'query Article($id: String!) { asset(id: $id) { id } }'
    expect(await useGraphQL(query, { id: '1" } evil' })).toEqual({ ok: true })

    const url = requestUrl()
    expect(url.origin + url.pathname).toBe('https://api.test/assets')
    expect(url.searchParams.get('query')).toBe(query)
    // Values travel as variables, never interpolated into the query text
    expect(url.searchParams.get('variables')).toBe('{"id":"1\\" } evil"}')

    expect(fetchMock.mock.calls[0]![1].headers).toMatchObject({
      'x-api-key': 'test-key',
      'x-sitecode': 'TEST',
      'User-Agent': 'test-agent'
    })
  })

  it('omits variables when there are none', async () => {
    await useGraphQL('{ asset(id: "1") { id } }')
    expect(requestUrl().searchParams.has('variables')).toBe(false)
  })

  it('appends the CardFields fragment only when the query uses it', async () => {
    await useGraphQL(
      'query Front { front(id: "x") { layoutModules { contents { asset { ...CardFields } } } } }'
    )
    expect(requestUrl().searchParams.get('query')).toContain('fragment CardFields on Asset')

    fetchMock.mockClear()
    await useGraphQL('query Article { asset(id: "1") { id } }')
    expect(requestUrl().searchParams.get('query')).not.toContain('fragment CardFields')
  })

  it('throws on GraphQL errors', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ errors: [{ message: 'Bad query' }] }) })
    await expect(useGraphQL('{ bad }')).rejects.toThrow('Bad query')
  })
})
