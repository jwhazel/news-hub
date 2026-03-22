type Crop = { name: string; path: string; width?: number; height?: number }

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
 */
export function buildImageUrl(
  crops: Crop[],
  orientation: string = 'horizontal',
  context: 'inline' | 'gallery' = 'inline'
): string {
  const { mediaBaseUrl } = useRuntimeConfig()

  const bestCrop = crops.find((c) => c.name === 'bestCrop') ?? crops[0]
  if (!bestCrop?.path) return ''

  const base = bestCrop.path.split('?')[0]
  const transformed = base.replace('https://www.gannett-cdn.com', `${mediaBaseUrl}/gcdn`)

  const nativeW = bestCrop.width ?? 0
  const nativeH = bestCrop.height ?? 0

  let w: number
  let h: number

  if (context === 'gallery') {
    if (orientation === 'vertical') {
      h = 1320
      w = nativeW && nativeH ? Math.round(1320 * (nativeW / nativeH)) : 1320
    } else {
      w = 1320
      h = nativeW && nativeH ? Math.round(1320 * (nativeH / nativeW)) : 743
    }
  } else {
    if (nativeW > 0 && nativeW < 600) {
      w = nativeW
      h = nativeH
    } else if (orientation === 'vertical') {
      w = 600
      h = nativeW && nativeH ? Math.round(600 * (nativeH / nativeW)) : 800
    } else {
      w = 1320
      h = nativeW && nativeH ? Math.round(1320 * (nativeH / nativeW)) : 743
    }
  }

  if (!w || !h) {
    return `${transformed}?width=1320&format=pjpg&auto=webp`
  }

  return `${transformed}?width=${w}&height=${h}&fit=crop&format=pjpg&auto=webp`
}
