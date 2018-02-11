(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = ["core.parser"];

    function ContainerManagerExtender(parser) {
        var module = this.module;
        var vars = core.vars;
        var base = this.module.get("core.base");

        this.module.define("core.rendered", RenderedContainer);

        function RenderedContainer(trackId) {
            this.super.constructor.call(this, trackId);

            this._events = core.vars.merge(this._events, {
                beforeRender: null,
                afterRender: null
            });

            this.processable = true;
        }

        RenderedContainer.prototype = core.vars.extendPrototype(base.prototype, {
            constructor: RenderedContainer,
            _isInvalidated: true,
            _render: renderContainer,
            process: processContainer,
            invalidate: invalidateContainer,
            setContents: setContents
        });
     
        function renderContainer() {
            var payload = this.getPayload();
            this.triggerEvent('beforeRender');

            if (vars.isFunction(payload)) {
                payload(this.owner, this);
            } else if (vars.isObject(payload)) {
                payload._render && payload._render(this.owner, this);
            }

            this._isInvalidated = false;
        }

        function processContainer() {
            if (!this._isInvalidated) {
                return;
            }

            this._render();

            parser.begin();
            parser.pushElement(this.owner);
            parser.end();

            this.triggerEvent('afterRender');
        }

        function invalidateContainer() {
            this._isInvalidated = true;
            module.processContainers();
        }

        function setContents(contents) {
            if (!this.owner) {
                return;
            }

            var deletedElements = core.html.setContents(this.owner, contents);
            module.processDeleted(deletedElements);
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);