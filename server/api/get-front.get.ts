import { useGraphQL } from './utils/graphql'
import { transformArticleCard } from './utils/schema'

const sanitize = (val: unknown): string | null =>
  val ? String(val).replace(/[^a-z0-9-]/gi, '') : null

export default defineEventHandler(async (event) => {
  const { sitecode } = useRuntimeConfig()
  const query = getQuery(event)
  const section = sanitize(query.section)

  const frontId = `section-front_${sitecode}_${section ?? 'home'}`

  const gqlQuery = `{
    front(id: "${frontId}") {
      layoutModules {
        moduleName
        totalContents
        contents {
          asset {
            id
            headline
            type
            initialPublishDate
            updateDate
            promoBrief
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
      }
    }
  }`

  const data = await useGraphQL(gqlQuery)
  const front = data.front

  if (!front) {
    return { articles: [], cursor: null, numResults: 0 }
  }

  const modules: any[] = front.layoutModules ?? []
  const contentList =
    modules.find((m: any) => m.moduleName === 'content-list') ??
    modules.reduce((a: any, b: any) => (a.totalContents > b.totalContents ? a : b), modules[0])

  const articles = (contentList?.contents ?? [])
    .filter((c: any) => c.asset?.type === 'text')
    .map((c: any) => transformArticleCard(c.asset))

  return { articles, cursor: null, numResults: articles.length }
})
