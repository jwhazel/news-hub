type Crop = { name: string; path: string; width?: number; height?: number }

/** `edge * a / b` worked out at 1x, rounded up, then doubled. Multiplies before dividing so exact ratios stay exact. */
function retinaEdge(edge: number, a: number, b: number): number {
  return Math.ceil(((edge / 2) * a) / b) * 2
}

function toMediaUrl(path: string, mediaBaseUrl: string): string {
  return path.replace('https://www.gannett-cdn.com', `${mediaBaseUrl}/gcdn`)
}

/**
 * Featured images (home lead, article hero) and card thumbnails reuse the desktop site's
 * exact transforms so requests can share its Fastly cache: the 16_9 crop's own `crop=`
 * params followed by a fixed output size, e.g.
 *   .../84323002007-x.jpg?crop=3996,2249,x2,y121&width=1320&height=740&format=pjpg&auto=webp
 *   .../92477160007-x.JPG?crop=5087,2863,x0,y264&width=320&height=180&format=pjpg&auto=webp
 * Both fall back to buildImageUrl when there is no 16_9 crop.
 */
export function buildFeaturedImageUrl(crops: Crop[]): string {
  return buildNamedCropUrl(crops, '16_9', 1320, 740) ?? buildImageUrl(crops)
}

export function buildThumbnailUrl(crops: Crop[]): string {
  return buildNamedCropUrl(crops, '16_9', 320, 180) ?? buildImageUrl(crops)
}

/** Square author headshot from the 1_1 crop, sized for a 96px avatar at 2x. */
export function buildAvatarUrl(crops: Crop[]): string {
  return buildNamedCropUrl(crops, '1_1', 192, 192) ?? buildImageUrl(crops)
}

function buildNamedCropUrl(
  crops: Crop[],
  name: string,
  width: number,
  height: number
): string | null {
  const { mediaBaseUrl } = useRuntimeConfig()

  const crop = crops.find((c) => c.name === name)
  if (!crop?.path.includes('?crop=')) return null

  return `${toMediaUrl(crop.path, mediaBaseUrl)}&width=${width}&height=${height}&format=pjpg&auto=webp`
}

/**
 * Transforms a Gannett CDN crops array into a Fastly Image Optimizer URL.
 *
 * Sizing logic:
 *
 * Inline (non-gallery):
 *   - bestCrop native width < 600 → use native dimensions as-is
 *   - orientation "vertical"      → width=600, height proportional to bestCrop
 *   - otherwise                   → width=1320, height proportional to bestCrop
 *
 * Gallery:
 *   - orientation "vertical"      → height=1320, width proportional to bestCrop
 *   - otherwise                   → width=1320, height proportional to bestCrop
 *
 * The proportional edge matches the desktop site: computed at 1x (half the fixed edge),
 * rounded up, then doubled, so it is always even (e.g. 1320x880.08 → 1320x882).
 */
export function buildImageUrl(
  crops: Crop[],
  orientation: string = 'horizontal',
  context: 'inline' | 'gallery' = 'inline'
): string {
  const { mediaBaseUrl } = useRuntimeConfig()

  const bestCrop = crops.find((c) => c.name === 'bestCrop') ?? crops[0]
  if (!bestCrop?.path) return ''

  const transformed = toMediaUrl(bestCrop.path.split('?')[0], mediaBaseUrl)

  const nativeW = bestCrop.width ?? 0
  const nativeH = bestCrop.height ?? 0

  let w: number
  let h: number

  if (context === 'gallery') {
    if (orientation === 'vertical') {
      h = 1320
      w = nativeW && nativeH ? retinaEdge(1320, nativeW, nativeH) : 1320
    } else {
      w = 1320
      h = nativeW && nativeH ? retinaEdge(1320, nativeH, nativeW) : 743
    }
  } else {
    if (nativeW > 0 && nativeW < 600) {
      w = nativeW
      h = nativeH
    } else if (orientation === 'vertical') {
      w = 600
      h = nativeW && nativeH ? retinaEdge(600, nativeH, nativeW) : 800
    } else {
      w = 1320
      h = nativeW && nativeH ? retinaEdge(1320, nativeH, nativeW) : 743
    }
  }

  if (!w || !h) {
    return `${transformed}?width=1320&format=pjpg&auto=webp`
  }

  return `${transformed}?width=${w}&height=${h}&fit=crop&format=pjpg&auto=webp`
}
