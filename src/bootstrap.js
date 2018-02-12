(function(core) {
    "use strict";
    core.modules.define("core.bootstrap", BootstrapModule);

    BootstrapModule.deps = ["core.parser", "core.event.group"];

    function BootstrapModule(parser, makeEventGroup) {
        function Bootstrap() {
            this.events = makeEventGroup([
                'beforeBootstrap',
                'afterBootstrap',
            ], this);
        }

        Bootstrap.prototype.run = runBootstrap;

        var bootstrap = new Bootstrap();
        core.modules.defineRunnable("core.bootstrap", function() {
            bootstrap.run();
        });

        return bootstrap;

        function runBootstrap() {
            if (!this.events.trigger('beforeBootstrap')) {
                return;
            }
            
            parser.begin();
            parser.pushElement(document);
            parser.end();

            this.events.trigger('afterBootstrap');
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);