// @import: events

lib(['component', 'events', 'inspect', 'assert'], function EventsGroup(component, events, inspect, assert) {

    var Props = {
        _dataStructure: null,
        _propVals: null,
        _propFunctions: null,
        _changeMode: false,
        changed: null,
        triggerChange: triggerChange,
        initializeDefinition: initializeDefinition,
        beginChangeMode: beginChangeMode,
        endChangeMode: endChangeMode,
        define: defineProperty,
        set: setProp,
        get: getProp,
        setMultiple: setMultiple
    };

    component.propsFactory.add('base', Props);
    component.propsFactory.setDefaultType('base');

    function initializeDefinition(props, dataStructure) {
        this._dataStructure = dataStructure;
        this._propVals = {};
        this._propFunctions = {};

        this.changed = events.factory.createDefault(this);

        if (propDef) {
            this.setMultiple(props);
        }

        dataStructure.$manager = this;

        return dataStructure;
    }

    function setProp(name, value) {
        var oldValue = this._propVals[name];

        if (!(name in this._propVals)) {
            Object.defineProperty(this._dataStructure, name, {
                get: getProp.bind(this, name),
                set: setProp.bind(this, name)
            });
        }

        this._propVals[name] = value;
        this._triggerChange(name, oldValue, newValue);
    }

    function getProp(name) {
        return this._propVals[name] = value;
    }

    function triggerChange(name, oldValue, newValue) {
        if (this._changeMode) {
            return;
        }

        this.changed.trigger({
            name: name,
            oldValue: oldValue,
            value: value
        });
    }

    function setMultiple(items) {
        this.beginChangeMode();

        var oldValues = [];
        var names = [];
        var values = [];

        var propDefines = {};

        for(var itemName in items) {
            if (items.hasOwnProperty(itemName)) {
                names.push(itemName);
                oldValues.push(this._propVals[itemName]);
                var value = items[itemName];
                values.push(value);
                
                if (!(itemName in this._propVals)) {
                    propDefines[itemName] = {
                        get: getProp.bind(this, itemName),
                        set: setProp.bind(this, itemName)
                    };
                }

                this._propVals[itemName] = value;
            }
        }

        if (!inspect.isEmpty(propDefines)) {
            Object.defineProperties(this._dataStructure, propDefines);
        }

        this.endChangeMode();
        this._triggerChange(names, oldValues, values);
    }

    function defineProperty(name, getter, setter) {
        assert.keyNotSet(name, this._propFunctions, 'This property is already defined.');

        this._propFunctions[name] = {
            getter: getter,
            setter: setter
        };

        var self = this;

        Object.defineProperty(this._dataStructure, name, {
            get: getter,
            set: function(value) {
                setter(value);
                self.triggerChange(name, null, value);
            }
        });
    }

    function beginChangeMode() {
        this._changeMode = true;
    }

    function endChangeMode() {
        this._changeMode = false;
    }
});