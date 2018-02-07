(function(core) {
    "use strict";

    core.modules.extend("core.components", ComponentManagerExtender);

    ComponentManagerExtender.deps = ["core.parser"];

    function ComponentManagerExtender(parser) {
		this.module.define("core.component.base", BaseComponent, null);

        function BaseComponent() {
        }

        BaseComponent.prototype._def = null;
        BaseComponent.prototype._props = null;
        BaseComponent.prototype.scope = null;
        BaseComponent.prototype.container = null;
        BaseComponent.prototype.template = null;
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype._render = renderComponent;
        BaseComponent.prototype.setup = setupComponent;
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
            if (!this.template) {
                return;
            }

            if (core.vars.isString(this.template)) {
                this.template = core.html.wrapRawHtml(this.template);
            }

            core.html.setContents(element, this.template);
        }

        function setupComponent(def, container) {
            this._def = def;
            this._props = {};
            this.container = container;
            this.scope = container.scope;
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);