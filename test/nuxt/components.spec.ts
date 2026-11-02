import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { ArticleCard as ArticleCardData } from '#shared/types'
import ArticleCard from '~/components/ArticleCard.vue'
import ArticleHero from '~/components/ArticleHero.vue'
import AuthorByline from '~/components/AuthorByline.vue'

const article: ArticleCardData = {
  id: '100',
  headline: 'Kentucky wins exhibition in overtime',
  promoBrief: 'Milan Momcilovic led the way',
  publishDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  ssts: { section: 'sports' },
  authors: [{ contributorId: '9244336002', byline: 'Ryan Black' }, { byline: 'Staff report' }],
  featuredImage: {
    path: 'https://media.test/photo.jpg?width=1320&height=740',
    thumbnail: 'https://media.test/photo.jpg?width=320&height=180'
  }
}

describe('AuthorByline', () => {
  it('links authors with an id and leaves overridden bylines as text', async () => {
    const wrapper = await mountSuspended(AuthorByline, { props: { authors: article.authors } })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('href')).toBe('/author/9244336002')
    expect(links[0]!.text()).toBe('Ryan Black')
    expect(wrapper.text()).toBe('Ryan Black, Staff report')
  })
})

describe('ArticleCard', () => {
  it('renders the card', async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } })
    expect(wrapper.get('h2 a').attributes('href')).toBe('/article/100')
    expect(wrapper.get('h2').text()).toBe(article.headline)
    expect(wrapper.get('img').attributes('src')).toBe(article.featuredImage!.thumbnail)
    expect(wrapper.text()).toContain('sports')
    expect(wrapper.text()).toContain('Milan Momcilovic led the way')
    expect(wrapper.get('time').text()).toBe('2 hours ago')
  })

  it('links bylines to author pages without nesting links', async () => {
    const wrapper = await mountSuspended(ArticleCard, { props: { article } })
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(['/article/100', '/author/9244336002'])
    // A link inside a link is invalid HTML and breaks hydration
    expect(wrapper.find('a a').exists()).toBe(false)
  })

  it('renders without an image or authors', async () => {
    const wrapper = await mountSuspended(ArticleCard, {
      props: { article: { ...article, featuredImage: undefined, authors: [] } }
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(1)
  })
})

describe('ArticleHero', () => {
  it('renders the section link, linked byline and long date', async () => {
    const wrapper = await mountSuspended(ArticleHero, {
      props: {
        headline: article.headline,
        subHead: 'A subhead',
        section: 'sports',
        authors: article.authors,
        date: '2026-10-28T20:00:39Z'
      }
    })
    expect(wrapper.get('h1').text()).toBe(article.headline)
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(['/?section=sports', '/author/9244336002'])
    expect(wrapper.get('time').text()).toMatch(/^\w+day, October 28, 2026$/)
  })
})
