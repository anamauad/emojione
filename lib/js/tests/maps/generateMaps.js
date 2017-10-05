var fs = require('fs');
var request = require('request');

var outputDir = './lib/js/tests/maps/';
var emojione_3_1 = 'https://cdn.jsdelivr.net/emojione/assets/3.1/png/32/';
var emojione_2_7_7 = 'https://cdn.jsdelivr.net/emojione/assets/png/';

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
function readUnicodeEmojiTestFile(emojiTestFilename, fn) {
    requestUrl(emojiTestFilename, function(body) {
            var emojis = [];

            body.split("\n").forEach(function(line) {

                if((line) && (line.substring(0, 1) !== "#")) {

                    var code = line.substring(0, line.indexOf(";")).trim().toLowerCase();
                    var unicode = toCodePointText(code);
                    var unicodeChar = line.substring(line.indexOf("#") + 1).replace(/[\w\s:]/g,'').trim();
                    emojis.push({
                        hexa: unicode.replace(/\\u/g, ' 0x').trim().split(' ').join(', ').toLowerCase(),
                        unicode: unicode,
                        filename: strip(code.split(' ')).join('-'),
                        unicodeChar: unicodeChar
                    });
                }
            });
            fn(emojis);
    });
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
function generateMapsFromEmojis(emojis) {
    generateCFileWithCodePoints(emojis);
    generateCFileWithFilenames(emojis);
    generateHtmlFileForEmoji(emojis);
}
function generateCFileWithCodePoints(emojis) {
    var lines = [];
    emojis.forEach(function(emoji) {
        lines.push('{ ' + emoji.hexa + ' },');
    });
    fs.writeFileSync(outputDir + "c-file-with-hexa-codepoints.txt", lines.join('\n').replace(/\\\\/g ,'\\'));
}
function generateCFileWithFilenames(emojis) {
    var lines = [];
    emojis.forEach(function(emoji) {
        lines.push('"' + emoji.filename + '.png",');
    });
    fs.writeFileSync(outputDir + "c-file-with-sequences.txt", lines.join('\n').replace(/\\\\/g ,'\\'));
}
function generateHtmlFileForEmoji(emojis) {
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
    fs.writeFileSync(outputDir + "html-file-with-images-277.html", '<html><head><base href="' + emojione_2_7_7 + '">' + lines.join('\n'));
    fs.writeFileSync(outputDir + "html-file-with-images-31.html", '<html><head><base href="' + emojione_3_1 + '">' + lines.join('\n'));
}
readUnicodeEmojiTestFile('http://unicode.org/Public/emoji/5.0/emoji-test.txt', generateMapsFromEmojis);
