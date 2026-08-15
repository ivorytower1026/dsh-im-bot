import qrcode from 'qrcode-generator'

/** Render a QR code locally as inline SVG (no external image service). */
export function qrSvgDataUrl(data: string, size = 240): string {
  const qr = qrcode(0, 'M')
  qr.addData(data)
  qr.make()
  const count = qr.getModuleCount()
  const cell = size / count
  let rects = ''
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (qr.isDark(x, y)) rects += `M${x * cell} ${y * cell}h${cell}v${cell}h-${cell}z`
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${rects}" fill="#000"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
