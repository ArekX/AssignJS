
lib(['component', 'events', 'inspect', 'assert', 'object'],
function(component, events, inspect, assert, object) {
    var idCounter = 0;

    var PropManager = {
        _id: 0,
        _props: null,
        _context: null,
        _changeModeStack: [],
        _changeMode: false,
        _setValue: setValue,
        _initializer: null,
        _parent: null,
        _children: null,
        changed: null,
        init: init,
        set: setProp,
        listen: listen,
        setMultiple: setMultiple,
        get: getProp,
        update: updateProps,
        beginChangeMode: beginChangeMode,
        endChangeMode: endChangeMode,
        triggerChanged: triggerChanged,
        create: createProperty,
        remove: removeProperty,
        reset: resetProps,
        createChild: createChild,
        destroy: destroy
    };

    component.propsFactory.add('base', PropManager);
    component.propsFactory.setDefaultType('base');

    function UnsetValue() {}

    function Property(propOptions) {
        this.getter = propOptions.get;
        this.setter = propOptions.set;
    }

    function createPropertyInstance(propOptions) {
        return new Property(propOptions);
    }

    function init(initializer, context) {
        this._initializer = initializer;
        this._context = context;
        this._id = idCounter++;
        this._children = {};
        this.changed = events.create(context);
        this.reset();
    }

    function resetProps() {
        this._props = this._initializer ?
                      this._initializer(createPropertyInstance) : {};
        this.triggerChanged();
    }

    function createProperty(propName, options) {
        var instance = createPropertyInstance(options);
        this.set(propName, instance);
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

            if (i < nameParts.length - 1 && !inspect.isObject(walker[nameParts[i]])) {
                var propName = nameParts.slice(0, i + 1).join('.');
                throw new Error('Cannot traverse property of ' + propName + ' because its not an object.');
            }

            walker = walker[nameParts[i]];
        }

        this._setValue(walker || this._props, nameParts[nameParts.length - 1], value);
    }

    function setValue(props, name, value) {
        if ((props[name] instanceof Property) && props[name].setter) {
            props[name].setter.call(this._context, value);
        } else {
            props[name] = value;
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
         var value = object.resolveValue(this._props, propName, UnsetValue);

         if (value instanceof Property) {
             value = value.getter ? value.getter.call(this._context) : UnsetValue;
         }

         if (value === UnsetValue && this.parent) {
              return this.parent.get(propName);
         }

         return value !== UnsetValue ? value : defaultValue;
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

    function endChangeMode(skipEvent) {
        this._changeMode = this._changeModeStack.pop();
        !skipEvent && this.triggerChanged();
    }

    function triggerChanged() {
        if (this._changeMode) {
           return;
        }

        this.changed.trigger();
    }

    function createChild(initializer, passProps) {
        var child = component.createProps(initializer, this._context);
        child.parent = this;
        this._children[child._id] = child;

        if (passProps) {
            this.changed.register(function() {
                child.beginChangeMode();
                for (var prop in passProps) {
                    if (passProps.hasOwnProperty(prop)) {
                        child.set(passProps[prop], child.parent.get(prop));
                    }
                }
                child.endChangeMode();
            });
        }

        return child;
    }

    function destroy() {
        for(var childId in this._children) {
            if (this._children.hasOwnProperty(childId)) {
                this._children[childId].destroy();
            }
        }

        if (this.parent) {
            delete this.parent._children[this._id];
        }

        this.parent = null;

        this._props = null;
        this._context = null;
        this._children = null;
        this._initializer = null;
        this.changed = null;
    }


    function listen(name, callback, defaultValue) {
        var self = this;
        var oldValue = self.get(name, defaultValue);

        return this.changed.register(function() {
            var newValue = self.get(name, defaultValue);
            if (oldValue !== newValue) {
                callback(newValue);
                oldValue = newValue;
            }
        });
    }

});
