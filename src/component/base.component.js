(function(core) {
    "use strict";

    core.modules.extend("core.components", ComponentManagerExtender);

    ComponentManagerExtender.deps = ["core.parser", "core.components.props", "core.scope"];

    function ComponentManagerExtender(parser, makeProps, makeScope) {
		this.module.define("core.component.base", BaseComponent, null);
        var vars = core.vars;

        function BaseComponent() {
        }

        BaseComponent.prototype.owner = null;
        BaseComponent.prototype.isComponent = true;
        BaseComponent.prototype.container = null;
        BaseComponent.prototype.template = null;
        BaseComponent.prototype._templateElement = null;
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype.destroy = null;
        BaseComponent.prototype.invalidate = invalidateContainer;
        BaseComponent.prototype.afterInit = null;
        BaseComponent.prototype.compRefAdded = null;
        BaseComponent.prototype.compRefRemoved = null;
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

            if (this.afterInit) {
                this.container.registerEvent('afterRender', this.afterInit.bind(this));
            }

            var compRefs = {};
            
            this.scope.events.itemSet.register(function(data) {
                var payload = vars.isFunction(data.item.getPayload) ? data.item.getPayload() : null;
                if (payload && payload.isComponent) {
                    compRefs[data.name] = payload;
                }
            });

            this.scope.events.itemUnset.register(function(data) {
                if (compRefs.hasOwnProperty(data.name)) {
                    delete compRefs[data.name];
                }
            });

            this.compRefs = compRefs;

            if (this.compRefAdded) {
                this.scope.events.itemSet.register(this.compRefAdded.bind(this));
            }

            if (this.compRefRemoved) {
                this.scope.events.itemUnset.register(this.compRefRemoved.bind(this));
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);