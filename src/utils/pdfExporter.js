import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import FileSaver from 'file-saver'

const W = 595.28, H = 841.89, M = 52, BOTTOM = H - 65
const ink = rgb(.15, .15, .13), muted = rgb(.42, .41, .38)
const accent = rgb(.82, .35, .24), rule = rgb(.87, .85, .81)
let fontRequest

async function loadFont() {
  if (!fontRequest) {
    fontRequest = fetch(`${import.meta.env.BASE_URL}fonts/ExpclipReadingSerif-Regular.ttf`)
      .then(async response => {
        const setupMessage = 'The PDF font is missing or invalid. Follow public/fonts/README.md to install ExpclipReadingSerif-Regular.ttf, then try again.'
        if (!response.ok) throw new Error(setupMessage)
        const bytes = await response.arrayBuffer()
        // Static hosts may return index.html with a 200 status for missing files.
        const signature = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength))
        if (signature.length !== 4 || signature[0] !== 0 || signature[1] !== 1 || signature[2] !== 0 || signature[3] !== 0) {
          throw new Error(setupMessage)
        }
        return bytes
      }).catch(error => { fontRequest = undefined; throw error })
  }
  return fontRequest
}

// fontBytes allows the same export path to be checked without a browser.
export async function buildHighlightsPdf({ quotes, books, includeDetails = true, fontBytes }) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  // The converted TrueType outlines support valid fontkit subsets, unlike
  // the original CID-keyed CFF font. Only glyphs used in this PDF are embedded.
  const font = await doc.embedFont(fontBytes || await loadFont(), { subset: true })
  doc.setTitle('My highlights')
  doc.setCreator('Expclip')
  const supported = new Set(font.getCharacterSet())
  const clean = value => String(value ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ')
  const check = value => {
    for (const char of value) {
      if (char !== '\n' && !supported.has(char.codePointAt(0))) {
        throw new Error(`The PDF font does not contain “${char}”. Remove or replace that character before exporting.`)
      }
    }
  }
  // Keep Latin words together; Chinese may wrap between characters.
  const wrap = (value, size, width) => {
    const text = clean(value)
    check(text)
    const lines = []
    for (const paragraph of text.split('\n')) {
      let line = ''
      const tokens = paragraph.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|\s+|[^\s]/gu) || []
      for (const token of tokens) {
        if (font.widthOfTextAtSize(line + token, size) <= width) { line += token; continue }
        if (line.trim()) { lines.push(line.trimEnd()); line = '' }
        for (const char of token.trimStart()) {
          if (font.widthOfTextAtSize(line + char, size) > width) { lines.push(line); line = '' }
          line += char
        }
      }
      lines.push(line.trimEnd())
    }
    return lines
  }
  let page, y
  const newPage = () => { page = doc.addPage([W, H]); y = M + 15 }
  const ensure = height => { if (y + height > BOTTOM) newPage() }
  const text = (value, x, baseline, size, color = ink) => page.drawText(value, { x, y: H - baseline, size, font, color })
  const line = (top, x = M) => page.drawLine({ start: { x, y: H - top }, end: { x: W - M, y: H - top }, thickness: .5, color: rule })
  const write = (value, size, leading, x = M, color = ink, marker = false) => {
    const lines = wrap(value, size, W - M - x)
    let segmentPage, segmentStart, segmentEnd
    const finishMarker = () => {
      if (!segmentPage) return
      segmentPage.drawLine({
        start: { x: M + 2, y: H - segmentStart + size },
        end: { x: M + 2, y: H - segmentEnd - 3 },
        thickness: 2.5, color: accent
      })
    }
    for (const content of lines) {
      ensure(leading)
      if (marker && segmentPage !== page) {
        finishMarker()
        segmentPage = page
        segmentStart = y
      }
      text(content, x, y, size, color)
      segmentEnd = y
      y += leading
    }
    finishMarker()
  }
  newPage()
  write('EXPCLIP READING MEMORY', 9, 24, M, accent)
  write('My highlights', 25, 38)
  line(y); y += 23
  write(`${quotes.length} highlights / Exported ${new Date().toLocaleDateString('en', { dateStyle: 'long' })}`, 9, 22, M, muted)
  y += 12
  const bookMap = new Map(books.map(book => [book.id, book]))
  let previousBook = Symbol('first')
  for (const quote of quotes) {
    if (includeDetails && quote.bookId !== previousBook) {
      const book = bookMap.get(quote.bookId)
      ensure(95)
      write(book?.title || 'Unknown book', 15, 23)
      write(book?.author || 'Unknown author', 10, 18, M, muted)
      line(y); y += 24
    }
    ensure(38)
    write(quote.text, 12, 20, M + 18, ink, true)
    if (includeDetails) {
      const date = new Date(quote.dateHighlighted || quote.dateAdded)
      const metadata = [
        quote.page ? `Page ${quote.page}` : '',
        quote.location || '',
        Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en', { dateStyle: 'medium' })
      ].filter(Boolean).join(' / ')
      if (metadata) { y += 7; write(metadata, 9, 15, M + 18, muted) }
    }
    y += 14
    if (y < BOTTOM) line(y, M + 18)
    y += 24
    previousBook = quote.bookId
  }
  const pages = doc.getPages()
  pages.forEach((p, index) => {
    page = p
    line(H - 42)
    text('EXPCLIP', M, H - 25, 8, muted)
    const count = `${index + 1} / ${pages.length}`
    text(count, W - M - font.widthOfTextAtSize(count, 8), H - 25, 8, muted)
  })
  return doc.save()
}

export async function downloadHighlightsPdf(options, filename = 'expclip-highlights.pdf') {
  const bytes = await buildHighlightsPdf(options)
  FileSaver.saveAs(new Blob([bytes], { type: 'application/pdf' }), filename)
}
