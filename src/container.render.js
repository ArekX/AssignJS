(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = ["core.parser"];

    function ContainerManagerExtender(parser) {
        var module = this.module;

        var base = this.module.get("core.base");

        this.module.define("core.rendered", RenderedContainer);

        function RenderedContainer(trackId) {
            this.super.constructor.call(this, trackId);

            this.events = core.vars.merge(this.events, {
                beforeRender: null,
                afterRender: null,
            });

            this.processable = true;
        }

        RenderedContainer.prototype = core.vars.extendPrototype(base.prototype, {
            constructor: RenderedContainer,
            _isInvalidated: true,
            _render: renderContainer,
            process: processContainer,
            invalidate: invalidateContainer
        });
     
        function renderContainer() {
            var payload = this.getPayload();
            this.triggerEvent('beforeRender');
            payload._render && payload._render(this.owner, this);
            this.triggerEvent('afterRender');
            this._isInvalidated = false;
        }

        function processContainer() {
            if (!this._isInvalidated) {
                return;
            }

            this._render();
            parser.pushElement(this.owner);
        }

        function invalidateContainer() {
            this._isInvalidated = true;
            module.processContainers();
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);