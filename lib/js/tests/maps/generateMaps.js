var fs = require('fs');
var request = require('request');

var outputDir = './lib/js/tests/maps/';

function u(codeUnit) {
    var code = codeUnit.toString(16).toUpperCase();
    if (code.length < 4) {
        return '\\u' + '0000'.substring(code.length) + code;
    }
    return '\\u' + code;
}
function toCodePointText(unicode) {
    var parts = [];
    var s;
    if(unicode.indexOf(" ") > -1) {
        s = unicode.split(' ');
    } else {
        s = [ unicode ];
    }
    s.forEach(function(value) {

        var codePoint = new Number('0x' + value);
        var TEN_BITS = parseInt('1111111111', 2);

        if (codePoint <= 0xFFFF) {
            parts.push(u(codePoint));
        } else {
            codePoint -= 0x10000;
            // Shift right to get to most significant 10 bits
            var leadingSurrogate = 0xD800 | (codePoint >> 10);
            // Mask to get least significant 10 bits
            var trailingSurrogate = 0xDC00 | (codePoint & TEN_BITS);
            parts.push(u(leadingSurrogate) + u(trailingSurrogate));
        }


    });
    return parts.join('').trim();
}
function requestUrl(url, fn) {
    request.get(url, function(error, response, body) {

            if(!error && response.statusCode == 200) {
                fn(body);
            }
        }
    );
}
function readUnicodeEmojiTestFile(fn, options) {
    var parsed = {};
    requestUrl(options.testFile, function(body) {
        parseEmojis(body, parsed);
        fn(parsed, options);
    });
}
function parseEmojis(body, parsed) {
    var emojis = parsed.emojis || [];
    var unicodes = parsed.unicodes || {};

    body.split("\n").forEach(function(line) {

        if((line) && (line.substring(0, 1) !== '#')) {

            var code = line.substring(0, line.indexOf(';')).trim().toLowerCase();
            var unicode = toCodePointText(code);

            if (!unicodes[unicode]) {
                var filename = strip(code.split(' ')).join('-');
                emojis.push({
                    hexa: unicode.replace(/\\u/g, ' 0x').trim().split(' ').join(', ').toLowerCase(),
                    unicode: unicode,
                    filename: filename,
                    unicodeChar: line.substring(line.indexOf('#') + 1).replace(/[\w\s:]/g,'').trim()
                });
                unicodes[unicode] = filename;
            }
        }
    });
    parsed.emojis = emojis;
    parsed.unicodes = unicodes;
}
function strip(sequenceArray) {
    // remove 200d from array
    var idx = sequenceArray.indexOf('200d');
    while (idx > -1) {
        sequenceArray.splice(idx, 1);
        idx = sequenceArray.indexOf('200d');
    }
    // remove fe0f from array
    idx = sequenceArray.indexOf('fe0f');
    while (idx > -1) {
        sequenceArray.splice(idx, 1);
        idx = sequenceArray.indexOf('fe0f');
    }
    return sequenceArray;
}
function generateMapsFromEmojis(parsed, options) {
    if (options.hexa) {
        generateCFileWithCodePoints(parsed.emojis);
    }
    if (options.filenames) {
        generateCFileWithFilenames(parsed.emojis);
    }
    if (options.unicodeToFilename) {
        generateFileWithUnicodeToFilename(parsed.unicodes);
    }
    if (options.html) {
        generateHtmlFileForEmoji(parsed.emojis, options.html);
    }
}
function generateCFileWithCodePoints(emojis) {
    var lines = [];
    emojis.forEach(function(emoji) {
        lines.push('{ ' + emoji.hexa + ' },');
    });
    fs.writeFileSync(outputDir + 'c-file-with-hexa-codepoints.txt',
        lines.join('\n').replace(/\\\\/g ,'\\'));
}
function generateCFileWithFilenames(emojis) {
    var lines = [];
    emojis.forEach(function(emoji) {
        lines.push('"' + emoji.filename + '.png",');
    });
    fs.writeFileSync(outputDir + 'c-file-with-sequences.txt',
        lines.join('\n').replace(/\\\\/g ,'\\'));
}
function generateFileWithUnicodeToFilename(map) {
    fs.writeFileSync(outputDir + 'unicode-to-filename.json',
        JSON.stringify(sortMap(map)).replace(/\\\\/g ,'\\').replace(/,/g, ',\n'));
}
function sortMap(map) {
    var sorted = {};
    Object.keys(map).sort().forEach(function(key) {
        sorted[key] = map[key];
    });
    return sorted;
}
function generateHtmlFileForEmoji(emojis, htmlOptions) {
    var template = '<img class="emojione" alt="<CODEPOINT>" title="<TITLE>" src="<FILENAME>.png">';

    var lines = [];
    lines.push('<meta charset="utf-8"/><style>.emojione {padding:1px;width:32px;}</style></head><body>');
    emojis.forEach(function(emoji) {
        lines.push(
            template.replace(
                '<CODEPOINT>', emoji.unicodeChar).replace(
                '<TITLE>', emoji.unicode).replace(
                '<FILENAME>', emoji.filename)
        );
    });
    lines.push('</body></html>')
    var html = lines.join('\n');

    htmlOptions.forEach(function(options) {
        fs.writeFileSync(outputDir + 'html-file-with-images' + options.suffix + '.html',
            '<html><head><base href="' + options.imgBase + '">' + html);
    });
}

readUnicodeEmojiTestFile(generateMapsFromEmojis, {
    testFile: 'http://unicode.org/Public/emoji/4.0/emoji-test.txt',
    hexa:true, filenames:true, unicodeToFilename: true,
    html: [
        {
            suffix: '_3_1',
            imgBase:'https://cdn.jsdelivr.net/emojione/assets/3.1/png/32/'
        }
//        ,{
//            suffix: '_2_7_7',
//            imgBase:'https://cdn.jsdelivr.net/emojione/assets/png/'
//        }
    ]});

function generateHtmlFileForEmojioneEscapeMap() {
    var punycode = require('punycode');
    var escapeMap = require('./../../emojione.js').jsEscapeMap;
    var emojis = [];
    Object.keys(escapeMap).sort().forEach(function(unicodeChar) {
        var code = punycode.ucs2.decode(unicodeChar).map(function(item) { return item.toString(16); }).join(' ');
        emojis.push({
            unicodeChar: unicodeChar,
            unicode: code,
            filename: escapeMap[unicodeChar]
        });
    });
    generateHtmlFileForEmoji(emojis, [{ suffix: '_emojione-jsEscapeMap',
        imgBase: 'https://cdn.jsdelivr.net/emojione/assets/3.1/png/32/'}]);
}
generateHtmlFileForEmojioneEscapeMap();