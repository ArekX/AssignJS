// @import: core

lib(['io', 'object'], function IoBase(io, object) {

    var AttributeIo = object.extend({
        _element: null,
        _attributeName: null,
        init: init,
        read: read,
        write: write
    }, io.BaseIo);

    io.addHandler('io.attribute', /\[.+\]/, AttributeIo);

    function init(part, config) {
        this._element = config.element;
        this._attributeName = part.substring(1, part.length - 1);
    }

    function read() {
        return this._element.getAttribute(this._attributeName);
    }

    function write(value) {
        this._element.setAttribute(this._attributeName, value);
    }
});
