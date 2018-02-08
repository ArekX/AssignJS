(function(core) {
    "use strict";
    core.modules.define("core.bootstrap", BootstrapModule);

    BootstrapModule.deps = ["core.parser", "core.event"];

    function BootstrapModule(parser, makeEventEmitter) {
        function Bootstrap() {
            this.events = {
                beforeBootstrap: makeEventEmitter(this),
                afterBootstrap: makeEventEmitter(this)
            };
        }

        Bootstrap.prototype.run = runBootstrap;

        var bootstrap = new Bootstrap();
        core.modules.defineRunnable("core.bootstrap", function() {
            bootstrap.run();
        });

        return bootstrap;

        function runBootstrap() {
            if (!this.events.beforeBootstrap.trigger()) {
                return;
            }
            
            parser.begin();
            parser.pushElement(document);
            parser.end();

            this.events.afterBootstrap.trigger();
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);