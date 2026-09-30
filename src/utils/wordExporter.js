import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import FileSaver from 'file-saver'

const font = { ascii: 'Georgia', hAnsi: 'Georgia', eastAsia: 'PMingLiU', cs: 'Georgia' }
const clean = value => String(value ?? '').replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
const runs = value => clean(value).split('\n').map((text,index) => new TextRun({text, ...(index ? {break:1} : {})}))

// Unicode text stays editable; Word uses local fonts instead of embedding a large font.
export async function buildHighlightsWord({ quotes, books, includeDetails = true }) {
  const children = [
    new Paragraph({ text:'My highlights', heading:HeadingLevel.TITLE }),
    new Paragraph({ text:`${quotes.length} highlights exported from Expclip`, spacing:{after:320} }),
  ]
  const bookMap = new Map(books.map(book => [book.id,book]))
  let previousBook = Symbol('first')
  for (const quote of quotes) {
    if (includeDetails && quote.bookId !== previousBook) {
      const book = bookMap.get(quote.bookId)
      children.push(new Paragraph({children:runs(book?.title || 'Unknown book'), heading:HeadingLevel.HEADING_1}))
      if (book?.author) children.push(new Paragraph({children:runs(book.author), keepNext:true, spacing:{after:200}}))
    }
    children.push(new Paragraph({children:runs(quote.text), spacing:{after:includeDetails ? 120 : 320}, widowControl:true}))
    if (includeDetails) {
      const date = new Date(quote.dateHighlighted || quote.dateAdded)
      const details = [quote.page ? `Page ${quote.page}` : '', quote.location ? `Location ${quote.location}` : '',
        Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en',{dateStyle:'medium'})].filter(Boolean).join(' / ')
      children.push(new Paragraph({children:[new TextRun({text:details,size:20,color:'666666'})], spacing:{after:320}}))
    }
    previousBook = quote.bookId
  }
  const doc = new Document({
    creator:'Expclip', title:'My highlights', description:'Exported book highlights',
    styles:{
      default:{document:{run:{font,size:24,color:'000000'},paragraph:{spacing:{line:360,after:160}}}},
      paragraphStyles:[
        {id:'Title',name:'Title',basedOn:'Normal',next:'Normal',run:{font,size:44,color:'000000'},paragraph:{spacing:{after:240},keepNext:true}},
        {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',run:{font,size:30,bold:true,color:'000000'},paragraph:{spacing:{before:280,after:120},keepNext:true}},
      ],
    },
    sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,bottom:1080,left:1080,right:1080}}},children}],
  })
  return Packer.toBlob(doc)
}

export async function downloadHighlightsWord(options, filename = 'expclip-highlights.docx') {
  FileSaver.saveAs(await buildHighlightsWord(options),filename)
}
