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
                var content = contents[i];

                if (inspect.isString(content)) {
                    content = document.createTextNode(content);
                }

                element.appendChild(content);
                ob._oldContents.push(content);
            }
            
            return;
        }

        if (isString) {
            element.textContent = contents;
            return;
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