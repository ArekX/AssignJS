
lib(['component', 'events', 'inspect', 'assert', 'object'],
function(component, events, inspect, assert, object) {

    var PropManager = {
        _props: null,
        _context: null,
        _changeModeStack: [],
        _changeMode: false,
        changed: null,
        init: init,
        set: setProp,
        setMultiple: setMultiple,
        get: getProp,
        update: updateProps,
        beginChangeMode: beginChangeMode,
        endChangeMode: endChangeMode,
        triggerChanged: triggerChanged
    };

    component.propsFactory.add('base', PropManager);
    component.propsFactory.setDefaultType('base');

    function init(initializer, context) {
        this._props = initializer();
        this._context = context;
        this.changed = events.create(context);
    }

    function setProp(propName, value, literal) {
        if (literal || (propName in this._props)) {
            props[propName] = value;
            this.changed.trigger();
            return;
        }

        var nameParts = propName.split('.');
        var walker = this._props;

        for(var i = 0; i < nameParts.length - 1; i++) {
            if (!nameParts[i] in walker) {
                walker[nameParts[i]] = {};
            }

            if (i < nameParts.length - 1 && !inspect.isPlainObject(walker[nameParts[i]])) {
                var propName = nameParts.slice(0, i + 1).join('.');
                throw new Error('Cannot traverse property of ' + propName + ' because its not an object.');
            }

            walker = walker[nameParts[i]];
        }

        walker[nameParts[nameParts.length - 1]] = value;

        this.triggerChanged();
    }

    function setMultiple(props) {
        this.beginChangeMode();
        for(var name in props) {
            if (props.hasOwnProperty(name)) {
               this.setProp(name, props[name], true);
            }
        }
        this.endChangeMode();
    }

    function getProp(propName, defaultValue) {
         return object.resolveValue(this._props, propName, defaultValue);
    }

    function updateProps(updateCallback) {
        this.beginChangeMode();
        updateCallback.call(this._context, this._props);
        this.endChangeMode();
    }

    function beginChangeMode() {
        this._changeModeStack.push(this._changeMode);
        this._changeMode = true;
    }

    function endChangeMode() {
        this._changeMode = this._changeModeStack.pop();
        this.triggerChanged();
    }

    function triggerChanged() {
        if (this._changeMode) {
           return;
        }

        this.changed.trigger();
    }
});
