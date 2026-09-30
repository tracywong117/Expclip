export const tagColors = {
  gray: {background:'#e9e7e3',color:'#595650'},
  brown: {background:'#eee0d5',color:'#79543b'},
  orange: {background:'#f8e3cc',color:'#93591e'},
  yellow: {background:'#f5edca',color:'#806619'},
  green: {background:'#deebdf',color:'#3b6748'},
  blue: {background:'#dce9f4',color:'#365f87'},
  purple: {background:'#e9e0f2',color:'#71518a'},
  pink: {background:'#f2dfe8',color:'#8c4e6a'},
  red: {background:'#f3dedb',color:'#984e45'},
}
export function tagStyle(tag, colors = {}) {
  const name = Object.hasOwn(colors,tag) ? colors[tag] : 'gray'
  return Object.hasOwn(tagColors,name) ? tagColors[name] : tagColors.gray
}
export function matchingTag(query, tags) {
  return tags.find(tag=>tag.toLocaleLowerCase()===query.trim().toLocaleLowerCase())
}
