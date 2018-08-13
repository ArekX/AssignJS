// @import: core

lib(['io', 'object'], function(io, object) {
    io.addHandler('io.literal', /\(.+\)/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite,
        canRead: true,
        canWrite: false
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
