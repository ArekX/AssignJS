document.querySelector('script[data-assign-js]').$main.extend(
	"core.component", 
	["core.parser", "core.container", "core.parser.assignments", "core.html"], 
function(parser, container, assignments, html) {
	var component = this.module;
	var main = this.main;
	var tracker = 1;

	var regex = /^([a-zA-Z_][a-zA-Z0-9_-]+)?@([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)(\(\))?$/;

	parser.add("core.track.property", regex, handleMakeProperty);

	function handleMakeProperty(line, element) {
		var parts = line.split(regex);

		if (parts.length !== 6) {
			main.throwError("Invalid property syntax.", {
				line: line,
				element: element
			});
		}

		var parentName = parts[1];
		var propertyName = parts[2];

		var trackerName = "core.track.property." + propertyName + (tracker++);

		var parent = container.findParentElement(element);
		var item = container.ensure(element, parent);

		var trackedProperty = null;

		var isFunction = parts[4] && !parts[5];

		item.hooks.onLink = hookOnLink;
		item.hooks.onUnlink = hookOnUnlink;

		function resolveProperty() {
			var component = this;

			if (!component.props) {
				main.throwError("Component does not have a props object!", {
					component: component,
					propertyName: propertyName,
					element: element
				});
			}

			var prop = component.props[propertyName];

			if (typeof prop === "undefined") {
				html.setContents(element, "");
			} else {
				if (isFunction) {
					html.setContents(element, prop());
				} else {
					html.setContents(element, prop);
				}
			}
			
			parser.parse(element);
		}

		function hookOnLink() {
			var parentContainer = getParentContainer();

			if (!parentContainer) {
				main.throwError("No parent container found!", {
					line: line,
					element: element
				});
			}

			parentContainer.registerPropertyResolver(propertyName, resolveProperty);
			parentContainer.events.afterRender.register(trackerName, resolveProperty);
			
			resolveProperty.apply(parentContainer.payload);
		}

		function hookOnUnlink() {
			getParentContainer().events.beforeRender.unregister(trackerName);
		}

		function getParentContainer() {
			var parentContainer = parent.$container;

			if (parentName) {
				return parentContainer.scope[parentName];
			}

			return parentContainer;
		}
	}
});