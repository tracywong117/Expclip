// Compare record fields, not IDs or user annotations (favorites, colors, tags).
export function clippingIdentity({ title, author, text, page, location, dateHighlighted, type = 'highlight' }) {
  const date = new Date(dateHighlighted)
  // Be conservative when the original highlight date is unavailable.
  if (!dateHighlighted || Number.isNaN(date.getTime())) return null
  return JSON.stringify([
    title ?? '', author ?? '',
    String(text ?? '').replace(/\r\n?/g, '\n').trim(),
    String(page ?? ''), String(location ?? ''), date.toISOString(), type,
  ])
}
