// @import: core

lib(['io', 'object'], function IoBase(io, object) {

    var NullIo = object.extend({
        init: init,
        read: nullFunction,
        write: nullFunction
    }, io.BaseIo);

    io.addHandler('io.null', /_/, NullIo, true);

    function init() {
        return NullIo;
    }

    function nullFunction() {
        return null;
    }
});