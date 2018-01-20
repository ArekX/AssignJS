(function(core) {
	core.modules.define("core.parser", ParserModule);

	ParserModule.deps = [];

	function ParserModule() {

	}
})(document.querySelector('script[data-assign-js-core]').$main);