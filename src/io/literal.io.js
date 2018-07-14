// @import: core

lib(['io', 'object'], function IoBase(io, object) {

    var LiteralIo = {
        _value: null,
        init: init,
        read: read,
        write: write
    };

    io.addHandler('io.literal', /\(.+\)/, LiteralIo);

    function init(part, config) {
        this._value = object.parseJson(part, null);
    }

    function read() {
        return this._value;
    }

    function write() {}
});