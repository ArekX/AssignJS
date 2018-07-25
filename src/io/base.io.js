// @import: core

lib(['io'], function IoBase(io) {

    var BaseIo = {
        init: init,
        read: nullFunction,
        shouldWrite: nullFunction,
        write: nullFunction
    };

    io.BaseIo = BaseIo;

    function init() {
        throw new Exception('Cannot instantiate this class.');
    }

    function nullFunction() {
        return false;
    }
});