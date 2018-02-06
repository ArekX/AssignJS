(function(core) {
    "use strict";

    core.modules.extend("core.components", ComponentManagerExtender);

    ComponentManagerExtender.deps = ["core.scope", "core.assignments", "core.event"];

    function ComponentManagerExtender() {
		this.module.define("core.component.base", BaseComponent, null);
    
        function BaseComponent() {
        }

        BaseComponent.prototype._props = null;
        BaseComponent.prototype.scope = null;
        BaseComponent.prototype.container = null;
        BaseComponent.prototype.template = null;
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype._render = renderComponent;
        BaseComponent.prototype.set = setProperty;
        BaseComponent.prototype.setMultiple = setMultipleProperties;
        BaseComponent.prototype.get = getProperty;

        function setProperty(property, value) {
            this._props[property] = value;
            this.container.invalidate();
        }

        function setMultipleProperties(properties) {
            for(var prop in properties) {
                if (properties.hasOwnProperty(prop)) {
                    this._props[prop] = properties[prop];
                }
            }

            this.container.invalidate();
        }

        function getProperty(property, defaultValue) {
            return prop in this._props ? this._props[prop] : core.vars.defaultValue(defaultValue, null);
        }

        function renderComponent(element) {
            console.log(element);

            if (this.template) {
                element.innerHTML = this.template;
            }
            // add isInvalidated functionality, which means that this will be rerendered again.
            // render me :)
            // html set contents from template if template is set.
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);