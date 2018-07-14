// @import: core

lib(['io', 'inspect', 'html'], function IoBase(io, inspect, html) {

    var HtmlIo = {
        _element: null,
        init: init,
        read: read,
        shouldWrite: shouldWrite,
        write: write
    };

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
        var ob = this._elementObject;
        
        ob._oldContents = contents;

        if (inspect.isElement(contents)) {
            element.innerHTML = '';
            element.appendChild(contents);
            return;
        }

        var isString = inspect.isString(contents);

        if (!isString && inspect.isIterable(contents)) {
            ob._oldContents = [];
            element.innerHTML = '';

            for (var i = 0; i < contents.length; i++) {
                element.appendChild(contents[i]);
                ob._oldContents.push(contents[i]);
            }
        }

        if (isString) {
            contents = html.encode(contents);
        }

        element.innerHTML = contents;
    }

    function shouldWrite(contents) {
        var ob = this._elementObject;
        var el = this._element;

        if (!ob._oldContents) {
            ob._oldContents = null;
        }

        if (!inspect.isIterable(contents) && (ob._oldContents === contents)) {
            return false;
        }

        if (inspect.isElementList(contents) && inspect.isElementParent(contents, el)) {
            return false;
        }

        return true;
    }
});