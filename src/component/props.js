(function(core) {
    "use strict";

    core.modules.define("core.components.props", MakeComponentProps);

    MakeComponentProps.deps = ["core.event.group"];

    function MakeComponentProps(makeEventGroup) {
        
        function Props(owner) {
            this.owner = owner;
            this._props = {};
            this.events = makeEventGroup([
                'created',
                'changed',
                'deleted'
            ], this);

            this.array = {
                push: this._pushArrayValue.bind(this),
                pop: this._popArrayValue.bind(this),
                insert: this._insertArrayValue.bind(this),
                replace: this._replaceArrayValue.bind(this),
                delete: this._deleteArrayValue.bind(this)
            };
        }

        Props.prototype.initialize = initialize;
        Props.prototype.set = setProperty;
        Props.prototype.delete = deleteProperty;
        Props.prototype.deleteMultiple = deleteMultipleProperties;
        Props.prototype.deleteAll = deleteAllProperties;
        Props.prototype.exists = propertyExists;
        Props.prototype.refresh = refreshProperty;
        Props.prototype.refreshAll = refreshAllProperties;
        Props.prototype.refreshMultiple = refreshMultipleProperties;
        Props.prototype.get = getProperty;
        Props.prototype.getMultiple = getMultipleProperties;
        Props.prototype.setMultiple = setMultipleProperties;
        Props.prototype._pushArrayValue = pushArrayValue;
        Props.prototype._popArrayValue = popArrayValue;
        Props.prototype._insertArrayValue = insertArrayValue;
        Props.prototype._replaceArrayValue = replaceArrayValue;
        Props.prototype._deleteArrayValue = deleteArrayValue;

        var assert = core.assert;
        return function(ownerComponent) {
            return new Props(ownerComponent);
        }

        function initialize(config) {
            this.owner = config.owner || null;
        }

        function propertyExists(prop) {
            return this._props.hasOwnProperty(prop);
        }

        function setProperty(prop, value) {
            assert.notIdentical(prop[0], '%', 'Props cannot start with % sign.');
            assert.notIdentical(prop[0], '@', 'Props cannot start with @ sign.');

            if (!this.exists(prop)) {
                this.events.trigger('created', {
                    type: 'single',
                    prop: prop, 
                    value: value
                });
            }
            this._props[prop] = value;
            this.refresh(prop);
        }

        function deleteProperty(prop) {
            if (!this.exists(prop)) {
                return;
            }

            var value = this.get(prop);

            delete this._props[prop];
            
            this.events.trigger('deleted', {
                type: 'single',
                prop: prop,
                value: value
            });

            this.refreshProperty(prop);
        }


        function deleteMultipleProperties(props) {
            var deletedProps = {};
            for (var i = 0; i < props.length; i++) {
                if (this.exists(prop)) {
                    var value = this._props[i];
                    delete this._props[props[i]];
                    deletedProps[props[i]] = value;
                }
            }

            this.events.trigger('deleted', {
                type: 'multiple',
                props: deletedProps
            });
            this.refreshMultiple(deletedProps);
        }

        function deleteAllProperties() {
            this.deleteMultiple(this._props);
        }

        function refreshProperty(prop) {
            this.events.trigger('changed', {
                type: 'single',
                prop: prop,
                value: this.get(prop, null)
            });
        }

        function refreshAllProperties() {
            this.refreshMultiple(this._props);
        }

        function refreshMultipleProperties(props) {
            this.events.trigger('changed', {
                type: 'multiple',
                props: props
            });
        }

        function getProperty(prop, defaultValue) {
            return this.exists(prop) ? this._props[prop] : defaultValue;
        }

        function getMultipleProperties(props, defaultValue) {
            var resultProps = {};
            for (var i = 0; i < props.length; i++) {
                resultProps[props[i]] = this.get(props[i], defaultValue);
            }

            return resultProps;
        }

        function setMultipleProperties(props) {

            var setProps = {};

            for(var name in props) {
                if (!props.hasOwnProperty(name)) {
                    continue;
                }

                this._props[name] = setProps[name] = props[name];
            }

            this.refreshMultiple(setProps);
        }


        function pushArrayValue(prop, value) {
            var propArray = this.get(prop);
            assert.isArray(propArray, 'This property must be an array.');
            propArray.push(value);
            this.refresh(prop);
        }

        function popArrayValue(prop, value) {
            var propArray = this.get(prop);
            
            assert.isArray(propArray, 'This property must be an array.');
            var value = propArray.pop(value);
            
            this.refresh(prop);

            return value;
        }

        function insertArrayValue(prop, at, value) {
           var propArray = this.get(prop);
           assert.isArray(propArray, 'This property must be an array.');
           propArray.splice(at, 0, value);
           this.refresh(prop);
        }


        function replaceArrayValue(prop, at, value) {
           var propArray = this.get(prop);
           assert.isArray(propArray, 'This property must be an array.');
           propArray.splice(at, 1, value);
           this.refresh(prop);
        }

        function deleteArrayValue(prop, at) {
           var propArray = this.get(prop);
           assert.isArray(propArray, 'This property must be an array.');
           propArray.splice(at, 1);
           this.refresh(prop);
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);