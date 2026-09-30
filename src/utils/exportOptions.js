const timestamp = quote => {
  const value = quote.dateHighlighted || quote.dateAdded
  const time = value ? new Date(value).getTime() : NaN
  return Number.isFinite(time) ? time : null
}
const locationNumbers = value => {
  const match = String(value ?? '').trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/)
  return match ? [Number(match[1]), Number(match[2] || match[1])] : null
}

export function firstHighlightDates(quotes) {
  const dates = new Map()
  for (const quote of quotes) {
    const time = timestamp(quote)
    if (time !== null && (!dates.has(quote.bookId) || time < dates.get(quote.bookId))) dates.set(quote.bookId,time)
  }
  return dates
}

export function sortLibraryBooks(books, quotes, order = 'title-asc') {
  const dates = firstHighlightDates(quotes)
  return [...books].sort((a,b) => {
    if (order === 'date-desc' || order === 'date-asc') {
      const left = dates.get(a.id) ?? null, right = dates.get(b.id) ?? null
      if (left === null) return right === null ? 0 : 1
      if (right === null) return -1
      return (left-right) * (order === 'date-desc' ? -1 : 1)
    }
    return (a.title || '').localeCompare(b.title || '', undefined, {numeric:true}) * (order === 'title-desc' ? -1 : 1)
  })
}

export function selectExportQuotes(quotes, books, {
  bookIds = null, favoritesOnly = false, sortBy = 'time', direction = 'asc',
  bookOrder = 'title-asc', dateFrom = '', dateTo = '',
} = {}) {
  const allowed = bookIds === null ? null : new Set(bookIds)
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
  const to = dateTo ? new Date(`${dateTo}T00:00:00`) : null
  if (to) to.setDate(to.getDate()+1)
  const groups = new Map()
  for (const quote of quotes) {
    const time = timestamp(quote)
    if (allowed && !allowed.has(quote.bookId)) continue
    if (favoritesOnly && !quote.isFavorite) continue
    if ((from !== null || to) && (time === null || (from !== null && time < from) || (to && time >= to.getTime()))) continue
    if (!groups.has(quote.bookId)) groups.set(quote.bookId, [])
    groups.get(quote.bookId).push(quote)
  }
  const bookMap = new Map(books.map(book => [book.id, book]))
  const groupIds = [...groups.keys()]
  // Use the book's full highlight history, not just the filtered export subset.
  const firstHighlights = new Map()
  for (const quote of quotes) {
    const time = timestamp(quote)
    if (time !== null && (!firstHighlights.has(quote.bookId) || time < firstHighlights.get(quote.bookId))) {
      firstHighlights.set(quote.bookId, time)
    }
  }
  if (bookOrder === 'date-desc') groupIds.sort((a,b) => {
    const left = firstHighlights.get(a) ?? null, right = firstHighlights.get(b) ?? null
    if (left === null) return right === null ? 0 : 1
    if (right === null) return -1
    return right-left
  })
  else if (bookOrder !== 'library') groupIds.sort((a,b) => {
    const name = id => bookMap.get(id)?.title || 'Unknown book'
    return name(a).localeCompare(name(b), undefined, {numeric:true}) * (bookOrder === 'title-desc' ? -1 : 1)
  })
  else {
    const order = new Map(books.map((book,index) => [book.id,index]))
    groupIds.sort((a,b) => (order.get(a) ?? Infinity)-(order.get(b) ?? Infinity))
  }
  const sign = direction === 'desc' ? -1 : 1
  return groupIds.flatMap(id => groups.get(id).sort((a,b) => {
    const left = sortBy === 'location' ? locationNumbers(a.location) : timestamp(a)
    const right = sortBy === 'location' ? locationNumbers(b.location) : timestamp(b)
    // Unknown values stay last in either direction. Equal values keep input order.
    if (left === null) return right === null ? 0 : 1
    if (right === null) return -1
    return sign * (sortBy === 'location' ? (left[0]-right[0] || left[1]-right[1]) : left-right)
  }))
}

const csvCell = value => `"${String(value ?? '').replaceAll('"','""')}"`
export function serializeTextExport(quotes, books, { format = 'txt', includeDetails = true } = {}) {
  const bookMap = new Map(books.map(book => [book.id,book]))
  if (format === 'csv') {
    const headers = includeDetails ? ['Quote','Book','Author','Page','Location','Date','Favorite'] : ['Quote']
    return '\uFEFF' + [headers.join(','), ...quotes.map(quote => {
      const book = bookMap.get(quote.bookId)
      return (includeDetails ? [quote.text,book?.title || '',book?.author || '',quote.page,quote.location,
        quote.dateHighlighted || quote.dateAdded || '',quote.isFavorite ? 'Yes' : 'No'] : [quote.text]).map(csvCell).join(',')
    })].join('\r\n')
  }
  let previousBook = Symbol('first')
  return quotes.map(quote => {
    const book = bookMap.get(quote.bookId)
    const heading = includeDetails && previousBook !== quote.bookId
      ? [book?.title || 'Unknown book',book?.author].filter(Boolean).join('\n')+'\n\n' : ''
    previousBook = quote.bookId
    const details = includeDetails ? [quote.page ? `Page ${quote.page}` : '',quote.location ? `Location ${quote.location}` : '',
      quote.dateHighlighted || quote.dateAdded || ''].filter(Boolean).join(' / ') : ''
    return heading + quote.text + (details ? '\n'+details : '')
  }).join('\n\n---\n\n')
}
