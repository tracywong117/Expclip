export const dataProcessor = {
    getInfo(s) {
        let InfoLength = s.length;
        let author_index_1 = s.indexOf('\r\n') - 1;
        let author_index_0 = 0;
        let book_index_0 = 0;
        let book_index_1 = 0;
        let page_index_0 = s.indexOf('on page ') + 'on page '.length;
        let page_index_1 = 0;
        let location_index_0 = s.indexOf('| location ') + '| location '.length;
        let location_index_1 = 0;
        let week_index_0 = s.indexOf("| Added on ") + '| Added on '.length;
        let week_index_1 = 0;
        let datetime_index_0 = 0;
        let datetime_index_1 = 0;
        let quote_index_0 = 0;

        for (let i = author_index_1; i >= 0; i--) {
            if (s[i] == '(') {
                author_index_0 = i + 1;
                book_index_1 = i - 1;
                break;
            }
        }
        for (let i = page_index_0; i < InfoLength; i++) {
            if (s[i] == '|') {
                page_index_1 = i - 1;
                break;
            }
        }
        for (let i = location_index_0; i < InfoLength; i++) {
            if (s[i] == '|') {
                location_index_1 = i - 1;
                break;
            }
        }
        for (let i = week_index_0; i < InfoLength; i++) {
            if (s[i] == ',') {
                week_index_1 = i;
                datetime_index_0 = i + 2;
                break;
            }
        }
        for (let i = datetime_index_0; i < InfoLength; i++) {
            if (s[i] == ':') {
                datetime_index_1 = i + 6;
                quote_index_0 = i + 10;
                break;
            }
        }

        return [
            s.substring(book_index_0, book_index_1),
            s.substring(author_index_0, author_index_1),
            s.substring(page_index_0, page_index_1),
            s.substring(location_index_0, location_index_1),
            s.substring(week_index_0, week_index_1),
            s.substring(datetime_index_0, datetime_index_1),
            s.substring(quote_index_0,)
        ];
    },

    processClippingsFile(content) {
        let text = content + "\r\n";
        let text_arr = text.split("==========\r\n");
        let records = [];

        for (let i = 0; i < text_arr.length; i++) {
            let info = this.getInfo(text_arr[i]);
            let record = {
                "index": i,
                "Book": info[0],
                "Author": info[1],
                "Page": info[2],
                "Location": info[3],
                "Week": info[4],
                "Datetime": info[5],
                "Quote": info[6],
                "Editable": false,
                "Color": "yellow",
            };
            records.push(record);
        }
        records.pop();
        return records;
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