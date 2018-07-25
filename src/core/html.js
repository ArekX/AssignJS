lib(function CoreHtml() {
    function RawHtmlContents(contents) {
        this.contents = contents; 
    }

    RawHtmlContents.prototype.toString = function() {
        return this.contents;
    };

    this.html = {
        _rawHtmlConstructor: RawHtmlContents,
        toRawHtml: toRawHtml
    };

    function toRawHtml(contents) {
        return new RawHtmlContents(contents);
    }
});