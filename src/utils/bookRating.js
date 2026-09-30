export const normalizeRating = value => Math.max(0,Math.min(6,Math.floor(Number(value)||0)))
export const visibleStars = value => normalizeRating(value)>=5 ? 6 : 5
export const matchesRating = (value, selected) => selected==='all' || normalizeRating(value)===Number(selected)
export function nextRating(current, clicked) {
  const rating=normalizeRating(current)
  if(!Number.isInteger(clicked)||clicked<1||clicked>visibleStars(rating))return rating
  return rating===clicked ? 0 : clicked
}
export function ratingText(value) {
  const rating=normalizeRating(value)
  return '★'.repeat(rating)+'☆'.repeat(Math.max(0,5-rating))
}
