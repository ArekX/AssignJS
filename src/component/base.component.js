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
        BaseComponent.prototype.initialize = null;
        BaseComponent.prototype.destroy = null;
        BaseComponent.prototype.afterInit = null;
        BaseComponent.prototype.compRefAdded = null;
        BaseComponent.prototype.compRefRemoved = null;
        BaseComponent.prototype._templateElement = null;
        BaseComponent.prototype._render = renderComponent;
        BaseComponent.prototype.invalidate = invalidateContainer;
        BaseComponent.prototype.setup = setupComponent;
        BaseComponent.prototype._setupCompRefs = setupCompRefs;

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
                this.container.events.register('beforeUnlink', this.destroy.bind(this));
            }

            if (this.afterInit) {
                this.container.events.register('afterRender', this.afterInit.bind(this));
            }

            this._setupCompRefs();
        }

        function setupCompRefs() {
            var compRefs = {};
            var compRefAdded = this.compRefAdded ? this.compRefAdded.bind(this) : null;
            var compRefRemoved = this.compRefRemoved ? this.compRefRemoved.bind(this) : null;

            this.compRefs = compRefs;
            
            this.scope.events.register('itemSet', function(data) {
                var payload = vars.isFunction(data.item.getPayload) ? data.item.getPayload() : null;
                if (payload && payload.isComponent) {
                    compRefs[data.name] = payload;

                    compRefAdded && compRefAdded({name: data.name, component: payload});
                }
            });

            this.scope.events.register('itemUnset', function(data) {
                if (compRefs.hasOwnProperty(data.name)) {
                    var component = compRefs[data.name];
                    delete compRefs[data.name];
                    compRefRemoved && compRefRemoved({name: data.name, component: component});
                }
            });
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);