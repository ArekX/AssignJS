(function(core) {
    "use strict";

    core.modules.define("core.components.props", MakeComponentProps);

    MakeComponentProps.deps = ["core.event"];

    function MakeComponentProps(makeEventEmitter) {
		
        function Props() {
            this._props = {};
            this.events = {
                changed: makeEventEmitter(this),
            };
        }

        Props.prototype.set = setProperty;
        Props.prototype.get = getProperty;
        Props.prototype.setMultiple = setMultipleProperties;

        return function() {
            return new Props();
        }

        function setProperty(prop, value) {
            this._props[prop] = value;
            this.events.changed.trigger({
                type: 'single',
                prop: prop,
                value: value
            });
        }

        function getProperty(prop, defaultValue) {
            return this._props.hasOwnProperty(prop) ? this._props[prop] : defaultValue;
        }

        function setMultipleProperties(props) {
            for(var name in props) {
                if (!props.hasOwnProperty(name)) {
                    continue;
                }

                this._props[name] = props[name];
            }

            this.events.changed.trigger({
                type: 'multiple',
                props: props
            });
        }

    }
})(document.querySelector('script[data-assign-js-core]').$main);