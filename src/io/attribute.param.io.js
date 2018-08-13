// @import: core

lib(['io'], function(io) {
    io.addHandler('io.attribute.param', /\%(.+)/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite,
        canRead: true
    });

    function init(element, ioPart) {
        return {
          attributeName: ioPart.substring(1)
        };
    }

    function read() {
        return this.element[this.attributeName];
    }

    function write(value) {
        this.element[this.attributeName] = value;
    }

    function shouldWrite(value) {
        return this.element[this.attributeName] !== value;
    }
});
