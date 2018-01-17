document.querySelector('script[data-assign-js]').$main.extend(
	"core.parser", 
	["core.parser.assignments", "core.container"], 
function(assignments, containerManager) {
	var parser = this.module;
	var main = this.main;

	var makePropertyRegex = /^:([a-zA-Z_][a-zA-Z0-9_]+)?([a-zA-Z0-9_:\ ,<>-]+)?$/;

	parser.add("core.make.property", makePropertyRegex, handleMakeProperty);

	function handleMakeProperty(line, element) {
		var parent = containerManager.findParentElement(element);

		var parts = line.split(makePropertyRegex);

		if (parts.length !== 4) {
			main.throwError("Cannot parse property assignment. Invalid property syntax.", {
				line: line,
				element: element
			});
		}

		var propertyName = parts[1];
		var assignOperations = parts[2] ? assignments.parse(parts[2]) : [];

		var parentContainer = containerManager.ensure(parent);

		if (propertyName in parentContainer.scope) {
			main.throwError("Property is already defined in parent.", {
				parent: parent,
				line: line,
				element: element
			});
		}

		var item = containerManager.ensure(element, parent);
		parentContainer.scope[propertyName] = item;
		item.payload = element;

		item.hooks.onLink = function() {
			assignments.assign(item, parentContainer.scope, assignOperations);
		};

		containerManager.relink(item);
	}
});