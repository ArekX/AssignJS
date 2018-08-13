// @import: core

lib(['io', 'inspect'], function(io, inspect) {
    io.addHandler('io.property', /\@[^\ ]+\s*/, {
        init: init,
        read: read,
        write: write,
        shouldWrite: shouldWrite,
        canRead: true
    });

    function init(element, ioPart) {
        var ob = inspect.getElementObject(element);
        return {
            prop: ioPart.substring(1),
            ob: ob
        };
    }

    function read() {
        return this.ob.context.props.get(this.prop);
    }

    function write(value) {
        this.ob.context.props.set(this.prop, value);
    }

    function shouldWrite(value) {
        return true;
    }
});
