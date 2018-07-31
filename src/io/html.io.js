// @import: core

lib(['io', 'inspect', 'html', 'object'], function IoBase(io, inspect, html, object) {

    var HtmlIo = object.extend({
        _element: null,
        init: init,
        read: read,
        shouldWrite: shouldWrite,
        write: write
    }, io.BaseIo);

    io.addHandler('io.html', /\~html/, HtmlIo);

    function init(part, config) {
        this._element = config.element;
        this._elementObject = inspect.getElementObject(this._element);
    }

    function read() {
        return this._element.innerHTML;
    }

    function write(contents) {
        var element = this._element;
        var io = this._elementObject.io;

        io.$oldContents = null;
        element.innerHTML = '';

        if (contents && inspect.isIterable(contents)) {
            for (var i = 0; i < contents.length; i++) {
                writeItem(element, contents[i]);
            }

            return;
        }

        io.$oldContents = contents;
        writeItem(element, contents);
    }

    function writeItem(element, contents) {
        if (html.isRawHtml(contents)) {
           contents = contents.toElement();
        }

        if (!(contents instanceof Node)) {
           contents = html.toTextNode(contents);
        }

        element.appendChild(contents);
    }

    function shouldWrite(contents) {
        var io = this._elementObject.io;
        var el = this._element;

        if (!io.$oldContents) {
            io.$oldContents = null;
        }

        if (inspect.isElementList(contents) && inspect.isElementParent(contents, el)) {
            return false;
        }

        if (io.$oldContents === null) {
           return true;
        }

        return io.$oldContents !== contents;
    }
});
