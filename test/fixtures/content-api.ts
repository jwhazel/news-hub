// Raw content API shapes (what server/queries/*.graphql return), modelled on real responses.
// Shared by the unit tests and the e2e mock server.

const CDN = 'https://www.gannett-cdn.com/authoring/authoring-images/2026/10/29/PLOU'

// Real crop set for asset 92489507007; the desktop site requests
// .../92489507007-tsm-1469-1.JPG?crop=5624,3164,x0,y0&width=1320&height=740&format=pjpg&auto=webp
export const crops = [
  { name: 'bestCrop', path: `${CDN}/92489507007-tsm-1469-1.JPG`, width: 5625, height: 3750 },
  {
    name: '16_9',
    path: `${CDN}/92489507007-tsm-1469-1.JPG?crop=5624,3164,x0,y0`,
    width: 5624,
    height: 3164
  },
  {
    name: '1_1',
    path: `${CDN}/92489507007-tsm-1469-1.JPG?crop=3750,3749,x562,y0`,
    width: 3750,
    height: 3749
  },
  {
    name: '4_3',
    path: `${CDN}/92489507007-tsm-1469-1.JPG?crop=5000,3749,x312,y0`,
    width: 5000,
    height: 3749
  }
]

// Legacy images have no 16_9 crop, only a bestCrop
export const legacyCrops = [
  {
    name: 'bestCrop',
    path: 'https://www.gannett-cdn.com/-mm-/abc/c=0-0-2000-2000/legacy.jpg',
    width: 2000,
    height: 2000
  }
]

export const author = {
  id: '9244336002',
  byline: 'Ryan Black',
  reporterBioTitle: 'University of Kentucky sports beat reporter',
  profileImage: { crops }
}

export function card(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    headline: `Headline ${id}`,
    type: 'text',
    initialPublishDate: '2026-10-28T20:00:39Z',
    promoBrief: `Promo brief ${id}`,
    ssts: { section: 'sports' },
    contributors: [{ contributorId: author.id, contributor: { byline: author.byline } }],
    links: { photo: { crops } },
    ...overrides
  }
}

export const article = {
  id: '100',
  headline: 'Kentucky wins exhibition in overtime',
  initialPublishDate: '2026-10-28T20:00:39Z',
  isBylineOverridden: false,
  bylineOverrideV2: '',
  contributors: [{ contributor: { id: author.id, byline: author.byline } }],
  ssts: { section: 'sports' },
  links: { photoId: '92489507007', photo: { crops } },
  subHead: 'Milan Momcilovic led the way',
  contentBody: [
    { type: 'text', value: '<p class="gnt_ar_b_p">Opening paragraph of the story.</p>' },
    { type: 'asset', value: '200' },
    { type: 'text', value: '<p>Closing paragraph.</p>' }
  ]
}

export const assets: Record<string, Record<string, unknown>> = {
  200: {
    id: '200',
    type: 'image',
    headline: '',
    crops,
    orientation: 'horizontal',
    caption: 'Fans fill Rupp Arena',
    credit: 'Matt Stone, The C-J'
  },
  201: {
    id: '201',
    type: 'gallery',
    headline: 'Gallery headline',
    title: 'Best photos from the game',
    links: {
      photo: { crops },
      assets: [
        {
          overrides: { caption: 'Override caption' },
          asset: {
            id: '210',
            crops,
            orientation: 'horizontal',
            caption: 'Original caption',
            credit: '',
            byline: 'Photographer Byline'
          }
        },
        // Photos without crops are dropped
        { overrides: { caption: '' }, asset: { id: '211', crops: [] } }
      ]
    }
  },
  202: {
    id: '202',
    type: 'video',
    headline: '',
    title: 'Postgame press conference',
    thumbnail: 'https://media.example/thumb.jpg',
    hlsURL: 'https://media.example/video.m3u8'
  },
  203: {
    id: '203',
    type: 'oembed',
    headline: '',
    html: '<blockquote class="twitter-tweet">Embedded post</blockquote>'
  },
  204: { id: '204', type: 'livestory', headline: 'Unsupported type' }
}
