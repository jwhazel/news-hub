async function useGraphQL(query: string) {
  const config = useRuntimeConfig()
  const endpoint = config.contentEndpoint as string
  const apiKey = config.contentApiKey as string
  const sitecode = config.sitecode as string
  const userAgent = config.userAgent as string

  return fetch(`${endpoint}?query=${encodeURI(query)}`, {
    method: 'GET',
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'content-type': 'application/graphql',
      'x-api-key': apiKey,
      'x-sitecode': sitecode,
      'User-Agent': userAgent
    }
  })
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      if (data.errors) {
        throw new Error(JSON.stringify(data.errors))
      }
      return data.data
    })
}

export { useGraphQL }
