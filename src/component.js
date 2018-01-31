(function(core) {
	core.modules.define("core.components", ComponentModule);

	ComponentModule.deps = ["core.container.manager", "core.manager.base", "core.parser", "core.event"];

	function ComponentModule(containerManager, makeManager, parser, makeEventEmitter) {
		var assert = core.assert;
		var main = this;
		var componentRegex = /^([a-zA-Z0-9_\.-]+)(:([a-zA-Z_][a-zA-Z0-9]+))?([a-zA-Z0-9_:\ ,<>-]+)?$/;
		
		function ComponentManager() {
			this.config = {
				container: "core.rendered"
			};
		}

		ComponentManager.prototype = makeManager();
		ComponentManager.prototype.parseDefinition = parseDefinition;
		ComponentManager.prototype.makeComponent = makeComponent;

		var manager = new ComponentManager();

		parser.define("core.component", componentRegex, manager.makeComponent.bind(manager));

		return manager;

		function parseDefinition(line, element) {
			var parts = line.split(componentRegex);

			assert.identical(parts.length, 6, "Cannot parse component assignment. Invalid property syntax.", {
				line: line,
				element: element
			});
			
			return {
				type: parts[1],
				referenceAs: parts[3] ? parts[3] : null,
				assignments: parts[4] || null
			};
		}


		function makeComponent(definition, element) {
			var data = this.parseDefinition(definition, element);
			var container = containerManager.wrapElement(element, this.config.container, {});

			console.log(data, container);
		}

	}
})(document.querySelector('script[data-assign-js-core]').$main);