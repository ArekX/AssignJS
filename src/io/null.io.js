// @import: core

lib(['io'], function IoBase(io) {

    var NullIo = {
        init: init,
        read: nullFunction,
        write: nullFunction
    };

    var nullIoObject

    io.addHandler('io.null', /_/, NullIo, true);

    function init() {
        return NullIo;
    }

    function nullFunction() {
        return null;
    }
});