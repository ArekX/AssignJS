lib(function CoreHtml() {
    function RawHtmlContents(contents) {
        this.contents = contents;
    }

    RawHtmlContents.prototype.toString = function() {
        return this.contents;
    };

    RawHtmlContents.prototype.toElement = function(containerTag) {
        var element = document.createElement(containerTag || 'div');
        element.innerHTML = this.contents;
        return element.children.length === 1 ? element.children[0] : element;
    }

    this.html = {
        isRawHtml: isRawHtml,
        toRawHtml: toRawHtml,
        toTextNode: toTextNode
    };

    function toTextNode(text) {
        return document.createTextNode(text);
    }

    function isRawHtml(object) {
        return object instanceof RawHtmlContents;
    }

    function toRawHtml(contents) {
        return new RawHtmlContents(contents);
    }
});
