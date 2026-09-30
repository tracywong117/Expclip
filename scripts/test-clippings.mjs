import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

// Load the browser ES module without changing the project's module mode.
const source = await readFile(new URL('../src/utils/dataProcessor.js', import.meta.url), 'utf8')
const { dataProcessor } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const missing = '<book_name>  \n- Your Highlight on Location 905-926 | Added on Monday, April 27, 2015 10:20:16 PM\n\n{Text}'
const complete = 'A book (with a subtitle) (Jane Doe)\n- Your Highlight on page 12-13 | location 905-926 | Added on Monday, April 27, 2015 10:20:16 PM\n\nFirst line\n\nSecond line'

test('missing author and page preserve the other fields', () => {
    const [record] = dataProcessor.processClippingsFile(missing)
    assert.deepEqual(record, {
        index: 0, Book: '<book_name>', Author: '', Page: '', Location: '905-926',
        Week: 'Monday', Datetime: 'April 27, 2015 10:20:16 PM', Quote: '{Text}',
        Editable: false, Color: 'yellow',
    })
    assert.equal(new Date(`${record.Week}, ${record.Datetime}`).getFullYear(), 2015)
})

test('complete records preserve author, page ranges, date and paragraphs', () => {
    const [record] = dataProcessor.processClippingsFile(complete)
    assert.equal(record.Book, 'A book (with a subtitle)')
    assert.equal(record.Author, 'Jane Doe')
    assert.equal(record.Page, '12-13')
    assert.equal(record.Location, '905-926')
    assert.equal(record.Datetime, 'April 27, 2015 10:20:16 PM')
    assert.equal(record.Quote, 'First line\n\nSecond line')
})

test('BOM, line endings and optional separators do not lose records', () => {
    for (const newline of ['\n', '\r\n', '\r']) {
        for (const suffix of ['', '\n==========', '\n==========\n']) {
            const input = ('\uFEFF' + missing + '\n==========\n' + complete + suffix).replace(/\n/g, newline)
            const records = dataProcessor.processClippingsFile(input)
            assert.equal(records.length, 2)
            assert.equal(records[0].Book, '<book_name>')
            assert.equal(records[1].Author, 'Jane Doe')
        }
    }
    assert.deepEqual(dataProcessor.processClippingsFile(''), [])
})

test('absent location stays empty, ignoring field names in quote text', () => {
    const [record] = dataProcessor.processClippingsFile('Title\n- Your Highlight on page 5 | Added on Monday, April 27, 2015 10:20:16 PM\n\nlocation 900 and on page 300')
    assert.equal(record.Page, '5')
    assert.equal(record.Location, '')
    assert.equal(record.Author, '')
})
