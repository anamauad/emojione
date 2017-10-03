'use strict';

var unicodes = {};
var shortnames = {};

for (var short in emojione.emojioneList) {
    var item = emojione.emojioneList[short];
    var unicodeChar = emojione.convert(item.uc_output.toUpperCase());
    unicodes[unicodeChar] = item.uc_output;
    shortnames[unicodeChar] = short;

    unicodeChar = emojione.convert(item.uc_match.toUpperCase());
    unicodes[unicodeChar] = item.uc_match;
    shortnames[unicodeChar] = short;

    if (!short.startsWith(':digit_')) {
        unicodeChar = emojione.convert(item.uc_base.toUpperCase());
        unicodes[unicodeChar] = item.uc_base;
        shortnames[unicodeChar] = short;
    }
}

QUnit.module('recognized by regular expression');
Object.keys(unicodes).forEach(function(unicodeChar) {
    QUnit.test(unicodeChar + ' ' + shortnames[unicodeChar], function( assert ) {
        var unicodeMatch;
        unicodeChar.replace(emojione.regUnicode, function(match) {
            // mapped emojis unicode is recognized in regular expression
            unicodeMatch = match;
            return unicodeChar;
        });
        assert.equal(unicodeMatch, unicodeChar);
    });
});

QUnit.module('unicode char is escaped');
Object.keys(unicodes).forEach(function(unicodeChar) {
    QUnit.test(unicodeChar + ' ' + shortnames[unicodeChar], function( assert ) {
        assert.ok(emojione.jsEscapeMap[unicodeChar]);
    });
});

QUnit.module('toShort: unicode char is translated to shortname');
Object.keys(unicodes).forEach(function(unicodeChar) {
    QUnit.test(unicodeChar + ' ' + shortnames[unicodeChar], function( assert ) {
        assert.equal(emojione.toShort(unicodeChar), shortnames[unicodeChar]);
    });
});

QUnit.module('unicodeToImage: unicode char is translated to image');
Object.keys(unicodes).forEach(function(unicodeChar) {
    QUnit.test(unicodeChar + ' ' + shortnames[unicodeChar], function( assert ) {
        var converted = emojione.unicodeToImage(unicodeChar);
        assert.ok(converted.contains('title="' + shortnames[unicodeChar] + '"'), converted);
    });
});