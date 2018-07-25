// @import: core

lib(['io', 'object'], function IoBase(io, object) {

    var LiteralIo = object.extend({
        _value: null,
        init: init,
        read: read,
        write: write
    }, io.BaseIo);

    io.addHandler('io.literal', /\(.+\)/, LiteralIo);

    function init(part) {
        this._value = object.parseJson(part, null);
    }

    function read() {
        return this._value;
    }

    function write() {}

    function shouldWrite() {
        return false;
    }
});