// @import: core

lib(['io'], function IoBase(io) {

    var PropertyIo = {
        _element: null,
        _component: null,
        _property: null,
        init: init,
        read: read,
        write: write
    };

    io.addHandler('io.property', /\@[a-zA-Z][a-zA-Z0-9_]+/, PropertyIo);

    function init(part, config) {
        this._property = part;
        this._element = config.element;
        this._component = config.component;
    }

    function read() {
        return this._component.props.get(this._property);
    }

    function write(value) {
        return this._component.props.set(this._property, value);
    }
});