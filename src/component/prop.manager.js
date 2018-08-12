
lib(['component', 'events', 'inspect', 'assert', 'object'],
function(component, events, inspect, assert, object) {

    var PropManager = {
        _props: null,
        _context: null,
        _changeModeStack: [],
        _changeMode: false,
        _setValue: setValue,
        changed: null,
        init: init,
        set: setProp,
        setMultiple: setMultiple,
        get: getProp,
        update: updateProps,
        beginChangeMode: beginChangeMode,
        endChangeMode: endChangeMode,
        triggerChanged: triggerChanged,
        createProperty: createProperty,
        remove: removeProperty
    };

    component.propsFactory.add('base', PropManager);
    component.propsFactory.setDefaultType('base');

    function Property(propOptions) {
        this.getter = propOptions.get;
        this.setter = propOptions.set;
    }

    function createProperty(propOptions) {
        return new Property(propOptions);
    }

    function init(initializer, context) {
        this._props = initializer(createProperty);
        this._context = context;
        this.changed = events.create(context);
    }

    function setProp(propName, value, literal) {
        if (literal || (propName in this._props)) {
            this._setValue(this._props, propName, value);
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
        this._setValue(walker || this._props, nameParts[nameParts.length - 1], value);
    }

    function setValue(props, name, value) {
        if (!(name in props)) {
            props[name] = value;
        } else {
            if (props[name] instanceof Property) {
                if (props[name].setter) {
                    props[name].setter.call(this._context);
                }
            }
        }
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
         var value = object.resolveValue(this._props, propName, defaultValue);

         if (value instanceof Property) {
             return value.getter ? value.getter.call(this._context) : defaultValue;
         }

         return value;
    }

    function updateProps(updateCallback) {
        this.beginChangeMode();
        updateCallback.call(this._context, this._props);
        this.endChangeMode();
    }

    function removeProperty(propName) {
        if (propName in this._props) {
           delete this._props[propName];
           this.triggerChanged();
           return;
        }

        var nameParts = propName.split('.');
        var walker = this._props;

        for(var i = 0; i < nameParts.length - 1; i++) {
            if (!(nameParts[i] in walker)) {
                return;
            }

            walker = walker[nameParts[i]];
        }

        delete walker[nameParts[nameParts.length - 1]];
        this.triggerChanged();
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
