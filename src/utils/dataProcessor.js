export const dataProcessor = {
    getInfo(s) {
        const lines = s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split('\n');
        const heading = lines[0].trim();
        const metadata = lines[1]?.trim() || '';
        // Author is optional. Only a trailing parenthesized field is an author.
        const author = heading.match(/^(.*)\s+\(([^()]*)\)$/);
        // Read optional fields from metadata, never from the title or quote.
        const page = metadata.match(/\bon\s+page\s+(\d+(?:\s*[-–]\s*\d+)?)/i)?.[1] || '';
        const location = metadata.match(/\blocation\s+(\d+(?:\s*[-–]\s*\d+)?)/i)?.[1] || '';
        const added = metadata.match(/\|\s*Added on\s+(.+)$/i)?.[1]?.trim() || '';
        const date = added.match(/^([^,]+),\s*(.*)$/);
        return [
            author ? author[1].trim() : heading,
            author ? author[2].trim() : '',
            page, location,
            date ? date[1] : '',
            date ? date[2] : added,
            lines.slice(2).join('\n').trim()
        ];
    },

    processClippingsFile(content) {
        // Support BOMs, different line endings, and missing final separators.
        const entries = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
            .split(/^==========[ \t]*$/m).map(entry => entry.trim()).filter(Boolean);
        return entries.map((entry, index) => {
            const info = this.getInfo(entry);
            return {
                index,
                Book: info[0], Author: info[1], Page: info[2], Location: info[3],
                Week: info[4], Datetime: info[5], Quote: info[6],
                Editable: false, Color: 'yellow',
            };
        });
    },

    generateExportContent(jsonRecords) {
        let str_temp = "";
        for (let i = 0; i < jsonRecords.length; i++) {
            str_temp += jsonRecords[i]["Book"];
            str_temp += ' (' + jsonRecords[i]["Author"];
            str_temp += ')\r\n- Your Highlight on page ' + jsonRecords[i]["Page"];
            str_temp += ' | location ' + jsonRecords[i]["Location"];
            str_temp += ' | Added on ' + jsonRecords[i]["Week"];
            str_temp += ', ' + jsonRecords[i]["Datetime"];
            str_temp += '\r\n\r\n' + jsonRecords[i]["Quote"];
            str_temp += ("==========\r\n");
        }
        return str_temp;
    }
};
