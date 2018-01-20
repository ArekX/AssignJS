(function(core) {
	core.modules.define("core.container", ContainerModule);

	ContainerModule.deps = ["core.parser"];

	function ContainerModule(parser) {

	}
})(document.querySelector('script[data-assign-js-core]').$main);