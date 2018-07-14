// @import: core

lib(['io'], function IoBase(io) {

    var AttributeIo = {
        _element: null,
        _attributeName: null,
        init: init,
        read: read,
        write: write
    };

    io.addHandler('io.attribute', /\[.+\]/, AttributeIo);

    function init(part, config) {
        this._element = config.element;
        this._attributeName = config.attributeName;
    }

    function read() {
        return this._element.getAttribute(this._attributeName);
    }

    function write(value) {
        this._element.setAttribute(this._attributeName, value);
    }
});