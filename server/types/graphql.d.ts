// .graphql files are imported as strings (see the graphql-string plugin in nuxt.config.ts)
declare module '*.graphql' {
  const query: string
  export default query
}
