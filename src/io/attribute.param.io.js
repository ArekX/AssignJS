// @import: core

lib(['io', 'object'], function IoBase(io, object) {

    var AttributeIo = object.extend({
        _element: null,
        _attributeName: null,
        init: init,
        read: read,
        write: write
    }, io.BaseIo);

    io.addHandler('io.attribute.param', /\%(.+)/, AttributeIo);

    function init(part, config) {
        this._element = config.element;
        this._attributeName = part.substring(1);
    }

    function read() {
        return this._element[this._attributeName];
    }

    function write(value) {
        this._element[this._attributeName] = value;
    }
});