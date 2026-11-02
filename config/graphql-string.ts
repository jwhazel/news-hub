// Import server/queries/*.graphql files as plain strings. Used by Nitro (nuxt.config.ts) and Vitest.
export function graphqlString() {
  return {
    name: 'graphql-string',
    transform(code: string, id: string) {
      if (id.endsWith('.graphql')) {
        return { code: `export default ${JSON.stringify(code)}`, map: null }
      }
    }
  }
}
