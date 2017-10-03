# Tests with UNICODE

Run `unicodeTests.html` in a browser with connection to the internet.

## Tests scenarios

1) Verify mapped emojis unicode is recognized by regular expression, and as a whole
1) Verify mapped emoji unicode char is in `jsEscape`
1) Verify conversion functions
1) Verify no missing emojis

### Verify mapped emojis unicode is recognized by regular expression

- Data source: `emojiList`
- Data attributes:
   1) `uc_output`
   1) `uc_base`
   1) `uc_match`
- Target: `regUnicode `

### Verify mapped emoji unicode char is escaped

- Data source: `emojiList`
- Data attributes:
   1) `uc_output`
   1) `uc_base`
   1) `uc_match`
- Target: `jsEscapeMap `

### Verify conversion functions

1) `toShort`
1) `unicodeToImage`

### Verify no missing emojis

- Data source: http://www.unicode.org/emoji/charts/emoji-ordering.txt
- Data attributes:
   1) code points
   1) emoji name
- Target: `emojiList` 
   
## Unicode Emoji

Specification:
- http://www.unicode.org/reports/tr51/
- http://www.unicode.org/emoji/charts/index.html
- http://cldr.unicode.org/translation/short-names-and-keywords

Emoji ordering:
- http://www.unicode.org/emoji/charts/emoji-ordering.html
- http://www.unicode.org/emoji/charts/emoji-ordering.txt

Emoji list:
- http://www.unicode.org/emoji/charts/emoji-list.html
- http://www.unicode.org/emoji/charts/full-emoji-list.html
- http://www.unicode.org/emoji/charts/emoji-released.html

ZERO WIDTH JOINER (ZWJ):
- http://www.unicode.org/emoji/charts/emoji-zwj-sequences.html