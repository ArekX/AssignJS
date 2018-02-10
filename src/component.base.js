(function(core) {
    "use strict";

    core.modules.extend("core.components", ComponentManagerExtender);

    ComponentManagerExtender.deps = ["core.parser", "core.components.props"];

    function ComponentManagerExtender(parser, makeProps) {
		this.module.define("core.component.base", BaseComponent, null);

        function BaseComponent() {
        }

        BaseComponent.prototype.owner = null;
        BaseComponent.prototype.container = null;
        BaseComponent.prototype.template = null;
        BaseComponent.prototype._templateElement = null;
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype.invalidate = invalidateContainer;
        BaseComponent.prototype._render = renderComponent;
        BaseComponent.prototype.setup = setupComponent;

        function renderComponent(element) {
            if (!this.template || this._templateElement) {
                return;
            }

            this._templateElement = core.html.parse(element, this.template);
        }

        function invalidateContainer() {
            this.container.invalidate();
        }

        function setupComponent(def, container) {
            this._def = def;
            this.props = makeProps();
            this.container = container;
            this.owner = container.owner;
            this.scope = container.scope;
            this.props.events.changed.register(this.invalidate.bind(this));
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);