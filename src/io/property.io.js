// @import: core

lib(['io'], function(io) {
    io.addHandler('io.property', /\@[^\ ]+\s*/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite,
        canRead: true,
        canWrite: true
    });

    function init(element, ioPart) {
        var component = imspect.getElementObject(element).component;
        return {
            prop: ioPart.substring(1),
            propManager: component.context.propManager
        };
    }

    function read() {
        return this.propManager.get(this.prop);
    }

    function write(value) {
        this.propManager.set(this.prop, value);
    }

    function shouldWrite(value) {
        return this.handler.read() !== value;
    }
});
