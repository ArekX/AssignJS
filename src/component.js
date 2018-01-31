(function(core) {
	core.modules.define("core.components", ComponentModule);

	ComponentModule.deps = ["core.container.manager", "core.manager.base", "core.parser", "core.event"];

	function ComponentModule(containerManager, makeManager, parser, makeEventEmitter) {

		var componentRegex = /^([a-zA-Z0-9_\.-]+)(:([a-zA-Z_][a-zA-Z0-9]+))?([a-zA-Z0-9_:\ ,<>-]+)?$/;
		var main = this;
		
		function ComponentManager() {
		}

		ComponentManager.prototype = makeManager();
		
		parser.define("core.component", componentRegex, makeComponent);

		return new ComponentManager();

		function parseLine(line) {
			var parts = line.split(componentRegex);

			if (parts.length !== 6) {
				throw {
					error: "Cannot parse component assignment. Invalid property syntax.",
					line: line,
					element: element
				};
			}

			return {
				type: parts[1],
				referenceAs: parts[3] ? parts[3] : null,
				assignments: parts[4] || null
			};
		}


		function makeComponent(line, element) {
			var data = parseLine(line);
			var container = containerManager.wrapElement(element, "core.rendered", {});

			console.log(data, container);
		}

	}
})(document.querySelector('script[data-assign-js-core]').$main);