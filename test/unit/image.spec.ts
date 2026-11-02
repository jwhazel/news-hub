import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildAvatarUrl,
  buildFeaturedImageUrl,
  buildImageUrl,
  buildThumbnailUrl
} from '../../server/api/utils/image'
import { crops, legacyCrops } from '../fixtures/content-api'

const IMAGE =
  'https://media.test/gcdn/authoring/authoring-images/2026/10/29/PLOU/92489507007-tsm-1469-1.JPG'

beforeEach(() => {
  vi.stubGlobal('useRuntimeConfig', () => ({ mediaBaseUrl: 'https://media.test' }))
})

describe('buildFeaturedImageUrl', () => {
  it('matches the desktop site transform exactly so requests share its cache', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ mediaBaseUrl: 'https://www.courier-journal.com' }))
    expect(buildFeaturedImageUrl(crops)).toBe(
      'https://www.courier-journal.com/gcdn/authoring/authoring-images/2026/10/29/PLOU/92489507007-tsm-1469-1.JPG?crop=5624,3164,x0,y0&width=1320&height=740&format=pjpg&auto=webp'
    )
  })

  it('falls back to the bestCrop transform when there is no 16_9 crop', () => {
    expect(buildFeaturedImageUrl(legacyCrops)).toBe(
      'https://media.test/gcdn/-mm-/abc/c=0-0-2000-2000/legacy.jpg?width=1320&height=1320&fit=crop&format=pjpg&auto=webp'
    )
  })
})

describe('buildThumbnailUrl', () => {
  it("uses the desktop site's 320x180 card transform of the 16_9 crop", () => {
    expect(buildThumbnailUrl(crops)).toBe(
      `${IMAGE}?crop=5624,3164,x0,y0&width=320&height=180&format=pjpg&auto=webp`
    )
  })

  it('falls back to the bestCrop transform when there is no 16_9 crop', () => {
    expect(buildThumbnailUrl(legacyCrops)).toBe(buildImageUrl(legacyCrops))
  })
})

describe('buildAvatarUrl', () => {
  it('uses the square 1_1 crop at 192x192', () => {
    expect(buildAvatarUrl(crops)).toBe(
      `${IMAGE}?crop=3750,3749,x562,y0&width=192&height=192&format=pjpg&auto=webp`
    )
  })
})

describe('buildImageUrl', () => {
  const sized = (w: number, h: number) =>
    `${IMAGE}?width=${w}&height=${h}&fit=crop&format=pjpg&auto=webp`

  it('sizes horizontal inline images to 1320 wide, keeping the bestCrop ratio', () => {
    expect(buildImageUrl(crops)).toBe(sized(1320, 880))
  })

  it('sizes vertical inline images to 600 wide', () => {
    expect(buildImageUrl(crops, 'vertical')).toBe(sized(600, 400))
  })

  it('sizes gallery images to 1320 on the long edge', () => {
    expect(buildImageUrl(crops, 'horizontal', 'gallery')).toBe(sized(1320, 880))
    expect(buildImageUrl(crops, 'vertical', 'gallery')).toBe(sized(1980, 1320))
  })

  // Gallery 91853589007: bestCrop sizes and the sizes the desktop site requests for them
  it.each([
    ['vertical', 4240, 4554, '1230x1320'],
    ['vertical', 3771, 4544, '1096x1320'],
    ['horizontal', 4971, 3314, '1320x880'],
    ['horizontal', 5698, 3799, '1320x882'],
    ['horizontal', 6148, 3134, '1320x674'],
    ['horizontal', 4459, 4393, '1320x1302'],
    ['horizontal', 6960, 4640, '1320x880'],
    ['horizontal', 6133, 4089, '1320x882'],
    ['horizontal', 6427, 4285, '1320x882'],
    ['horizontal', 6291, 4194, '1320x880']
  ])('matches desktop gallery sizing for a %s %ix%i photo', (orientation, width, height, size) => {
    const [w, h] = size.split('x')
    const photo = [{ name: 'bestCrop', path: crops[0]!.path, width, height }]
    expect(buildImageUrl(photo, orientation, 'gallery')).toBe(sized(Number(w), Number(h)))
  })

  it('keeps small images at their native size', () => {
    const small = [{ name: 'bestCrop', path: `${crops[0]!.path}`, width: 400, height: 300 }]
    expect(buildImageUrl(small)).toBe(sized(400, 300))
  })

  it('defaults to 1320x743 when dimensions are missing', () => {
    expect(buildImageUrl([{ name: 'bestCrop', path: crops[0]!.path }])).toBe(sized(1320, 743))
  })

  it('returns an empty string without crops', () => {
    expect(buildImageUrl([])).toBe('')
  })
})
