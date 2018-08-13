// @import: core

lib(['io'], function(io) {
    io.addHandler('io.attribute', /\[.+\]/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite,
        canRead: true
    });

    function init(element, ioPart) {
        return {
            attributeName: ioPart.substring(1, ioPart.length - 1)
        };
    }

    function read() {
        return this.element.getAttribute(this.attributeName);
    }

    function write(value) {
        this.element.setAttribute(this.attributeName, value);
    }

    function shouldWrite(value) {
        return this.element.getAttribute(this.attributeName) !== value;
    }
});
