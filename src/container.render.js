(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = [];

    function ContainerManagerExtender() {
        var module = this.module;

        var base = this.module.get("core.base");

        this.module.define("core.rendered", RenderedContainer);

        function RenderedContainer(trackId, payload, parentScope) {
            this.__proto__ = new base(trackId, payload, parentScope);

            this.events = {
                beforeInit: null,
                afterInit: null,
                beforeRender: null,
                afterRender: null,
                beforeLink: null,
                afterLink: null,
                afterDestroy: null,
            };
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);