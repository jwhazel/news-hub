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
  const cursor = query.cursor ? String(query.cursor).replace(/"/g, '\\"') : null

  const gqlQuery = `{
    searchAssetsBySSTS(
      site_codes: ["${sitecode}"]
      types: ["text"]
      size: ${size}
      sort_by_recent: true
      ${section ? `sections: ["${section}"]` : ''}
      ${subsection ? `subsections: ["${subsection}"]` : ''}
      ${cursor ? `cursor: "${cursor}"` : ''}
    ) {
      numResults
      cursor
      assets {
        id
        headline
        promoBrief
        initialPublishDate
        updateDate
        ssts { section subsection topic }
        contributors {
          ...on BaseContributors {
            contributorId
            contributor { byline profileUrl }
          }
        }
        links {
          photo {
            ...on image { crops { name path width height } }
          }
        }
      }
    }
  }`

  const data = await useGraphQL(gqlQuery)
  return transformArticleList(data.searchAssetsBySSTS)
})
