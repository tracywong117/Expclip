# PDF font setup

PDF export needs a compatible TrueType (`.ttf`) font; the rest of the app works without it.

## Download and install

1. Download a font from [Adobe Source Han Serif](https://github.com/adobe-fonts/source-han-serif), or use your own compatible TTF.
2. Copy the TTF into this folder and name it `ExpclipReadingSerif-Regular.ttf`.
3. Reload the app and test a PDF export with your text.

The final path must be:

```text
public/fonts/ExpclipReadingSerif-Regular.ttf
```

Choose a font that contains the characters in your quotes, book details, and the export's English headings. There is no fallback font. Static, single-face TrueType fonts are the supported setup; variable-font packages have not been verified with this exporter. An OTF file cannot be used just by changing its extension.

Keep the license supplied with your downloaded font alongside it locally.