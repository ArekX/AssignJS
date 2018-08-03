// @import: core

lib(['io', 'inspect', 'html', 'object'], function IoBase(io, inspect, html, object) {

    io.addHandler('io.html', /\~html/, {
         init: init,
         read: read,
         write: write,
         shouldWrite: shouldWrite
    });

    function init() {
        return {
            oldContents: null
        };
    }

    function read() {
        return this.element.innerHTML;
    }

    function write(contents) {
        this.oldContents = null;
        this.element.innerHTML = '';

        if (contents && inspect.isIterable(contents)) {
            for (var i = 0; i < contents.length; i++) {
                writeItem(this.element, contents[i]);
            }

            return;
        }

        this.oldContents = contents;
        writeItem(this.element, contents);
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
        if (inspect.isElementList(contents) &&
            inspect.isElementParent(contents, this.element)) {
            return false;
        }

        if (this.oldContents === null) {
           return true;
        }

        return this.oldContents !== contents;
    }
});
