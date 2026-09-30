const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

export function readingInsights(books, quotes, period, now = new Date()) {
  const thisYear = period === 'This year'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(today); end.setDate(end.getDate()+1)
  const currentYear = now.getFullYear()
  const start = new Date(currentYear, 0, 1)
  const dated = quotes.map(quote => ({ quote, date: new Date(quote.dateHighlighted || quote.dateAdded) }))
  const selected = thisYear ? dated.filter(({ date }) => date >= start && date < end) : dated
  const activeBookIds = new Set(selected.map(({ quote }) => quote.bookId))
  const selectedBooks = thisYear ? books.filter(book => activeBookIds.has(book.id)) : books
  const bookMap = new Map(books.map(book => [book.id, book]))
  const bookCounts = new Map(), authorCounts = new Map(), monthCounts = new Map(), yearCounts = new Map(), dailyCounts = new Map()
  for (const { quote, date } of selected) {
    bookCounts.set(quote.bookId, (bookCounts.get(quote.bookId) || 0)+1)
    const author = bookMap.get(quote.bookId)?.author || 'Unknown'
    authorCounts.set(author, (authorCounts.get(author) || 0)+1)
    if (!Number.isNaN(date.getTime())) {
      const key = dayKey(date)
      dailyCounts.set(key, (dailyCounts.get(key) || 0)+1)
      const month = key.slice(0,7)
      monthCounts.set(month, (monthCounts.get(month) || 0)+1)
      const year = date.getFullYear()
      yearCounts.set(year, (yearCounts.get(year) || 0)+1)
    }
  }
  const topBooks = selectedBooks.map(book => ({ ...book, count: bookCounts.get(book.id) || 0 }))
    .filter(book => book.count).sort((a,b) => b.count-a.count).slice(0,5)
  const maxAuthor = Math.max(1,...authorCounts.values())
  const topAuthors = [...authorCounts].map(([name,count]) => ({ name,count,width:count/maxAuthor*100 }))
    .sort((a,b) => b.count-a.count).slice(0,5)
  // Padded month keys sort chronologically, including October–December.
  const months = [...monthCounts].sort(([a],[b]) => a.localeCompare(b))
  const visibleMonths = thisYear ? Array.from({length:12}, (_,month) => {
    const key = `${currentYear}-${String(month+1).padStart(2,'0')}`
    return [key, monthCounts.get(key) || 0]
  }) : months
  const maxMonth = Math.max(1,...visibleMonths.map(([,count]) => count))
  const monthly = visibleMonths.map(([key,count]) => ({ key, count, height:count ? Math.max(8,count/maxMonth*100) : 0,
    future:thisYear && new Date(`${key}-01T00:00:00`) >= end,
    label:new Date(`${key}-01T00:00:00`).toLocaleDateString('en', { month:'short' }) }))
  const years = [...yearCounts.keys()].sort((a,b) => a-b)
  const maxYear = Math.max(1,...yearCounts.values())
  const yearly = years.length ? Array.from({length:years.at(-1)-years[0]+1}, (_,index) => {
    const year = years[0]+index, count = yearCounts.get(year) || 0
    return {key:String(year),label:String(year),count,height:count ? Math.max(8,count/maxYear*100) : 0}
  }) : []

  const gridStart = new Date(start); gridStart.setDate(gridStart.getDate()-gridStart.getDay())
  const yearEnd = new Date(currentYear,11,31)
  const gridEnd = new Date(yearEnd); gridEnd.setDate(gridEnd.getDate()+6-gridEnd.getDay())
  const heatmapDays = []
  for (const date = new Date(gridStart); date <= gridEnd; date.setDate(date.getDate()+1)) {
    const key = dayKey(date), outside = date < start || date > yearEnd, future = date >= end
    const count = outside || future ? 0 : dailyCounts.get(key) || 0
    heatmapDays.push({key, count, outside, future, label:date.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}),
      level:count===0?0:count===1?1:count<=3?2:count<=6?3:4})
  }
  const heatmapMonths = []
  heatmapDays.forEach((day,index) => {
    if (day.outside) return
    const key = day.key.slice(0,7)
    if (heatmapMonths.at(-1)?.key !== key) heatmapMonths.push({key,
      label:new Date(`${day.key}T00:00:00`).toLocaleDateString('en',{month:'short'}), column:Math.floor(index/7)+1})
  })
  return {
    currentYear,
    bookCount:selectedBooks.length, quoteCount:selected.length,
    favoriteCount:selected.filter(({quote}) => quote.isFavorite).length,
    authorCount:new Set(selectedBooks.map(book => book.author)).size,
    tagCount:new Set(selectedBooks.flatMap(book => book.tags || [])).size,
    average:selectedBooks.length ? (selected.length/selectedBooks.length).toFixed(1) : '0',
    topBooks, topAuthors, monthly, yearly, heatmapDays, heatmapMonths,
    heatmapColumns:heatmapDays.length/7,
    activeDays:heatmapDays.filter(day => day.count>0).length,
    yearlyTotal:heatmapDays.reduce((sum,day) => sum+day.count,0),
  }
}
