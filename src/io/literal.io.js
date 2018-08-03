// @import: core

lib(['io', 'object'], function IoLiteral(io, object) {
    io.addHandler('io.literal', /\(.+\)/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite
    });

    function init(element, ioPart) {
        return {
            value: object.parseJson(ioPart.substring(1, ioPart.length - 1), null)
        };
    }

    function read() {
        return this.value;
    }

    function write() {}

    function shouldWrite() {
        return false;
    }
});
