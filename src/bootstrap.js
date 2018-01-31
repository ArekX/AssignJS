(function(core) {
	core.modules.define("core.bootstrap", BootstrapModule);

	BootstrapModule.deps = ["core.parser", "core.event"];

	function BootstrapModule(parser, makeEventEmitter) {
		function Bootstrap() {
			this.config = {
				selector: "[data-assign]"
			};
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
			parser.parseAll(document.querySelectorAll(this.config.selector));
			this.events.afterBootstrap.trigger();
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);