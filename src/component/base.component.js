(function(core) {
    "use strict";

    core.modules.extend("core.components", ComponentManagerExtender);

    ComponentManagerExtender.deps = ["core.parser", "core.components.props", "core.container.manager"];

    function ComponentManagerExtender(parser, makeProps, containerManager) {
		this.module.define("core.component.base", BaseComponent, null);

        function BaseComponent() {
        }

        BaseComponent.prototype.owner = null;
        BaseComponent.prototype.container = null;
        BaseComponent.prototype.template = null;
        BaseComponent.prototype._templateElement = null;
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype.destroy = null;
        BaseComponent.prototype.invalidate = invalidateContainer;
        BaseComponent.prototype.afterRender = null;
        BaseComponent.prototype._render = renderComponent;
        BaseComponent.prototype.setup = setupComponent;

        function renderComponent(element) {
            if (!this.template || this._templateElement) {
                return;
            }

            this._templateElement = core.html.wrapRawHtml(this.template);
            this.container.setContents(this._templateElement);
        }

        function invalidateContainer() {
            this.container.invalidate();
        }

        function setupComponent(config, container) {
            this.config = config;
            this.props = makeProps(this);
            this.container = container;
            this.owner = container.owner;
            this.scope = container.scope;
            
            if (this.destroy) {
                this.container.registerEvent('beforeUnlink', this.destroy.bind(this));
            }

            if (this.afterRender) {
                this.container.registerEvent('afterRender', this.afterRender.bind(this));
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);