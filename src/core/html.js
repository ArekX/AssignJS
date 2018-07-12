lib(function CoreHtml() {
    function RawHtmlContents(contents) {
        this.contents = contents; 
    }

    RawHtmlContents.prototype.toString = function() {
        return this.contents;
    };

    this.html = {
        _rawHtmlConstructor: RawHtmlContents,
        encode: encode,
        toRawHtml: toRawHtml
    };

    function encode(contents) {
        return contents
            .replace(/\</g, '&lt;')
            .replace(/\&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\>/g, '&gt;');
    }

    function toRawHtml(contents) {
        return new RawHtmlContents(contents);
    }
});