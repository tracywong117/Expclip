export const hasHighlightNote = quote => typeof quote.note === 'string' && quote.note.trim().length > 0

export function filterHighlights(quotes, {query='',favoritesOnly=false,bookId='',tag='',withNotes=false}={}) {
  const search=query.toLocaleLowerCase()
  return quotes.filter(quote=>(!favoritesOnly||quote.isFavorite)&&
    (!bookId||quote.bookId===bookId)&&(!tag||(quote.tags||[]).includes(tag))&&
    (!withNotes||hasHighlightNote(quote))&&(!search||String(quote.text||'').toLocaleLowerCase().includes(search)))
}
