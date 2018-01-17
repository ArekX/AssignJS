document.querySelector('script[data-assign-js]').$main.set(
	"core.component", 
	["core.parser", "core.container", "core.parser.assignments", "core.events.emitter", "core.html"], 
function(parser, containerManager, assignments, createEvent, html) {
	var main = this.main;
	var componentRegex = /^([a-zA-Z0-9_\.-]+)(:([a-zA-Z_][a-zA-Z0-9]+))?([a-zA-Z0-9_:\ ,<>-]+)?$/;
	var registeredComponents = {};

	parser.add("core.make.component", componentRegex, handleMakeComponent);

	var module = {
		add: addComponent,
		as: getComponent
	};

	return module;

	function addComponent(componentNamespace, component) {
		main.assertValidNamespace(componentNamespace);

		if (componentNamespace in registeredComponents) {
			main.throwError("Component already registered.", {
				name: componentNamespace,
				component: component
			});
		}

		registeredComponents[componentNamespace] = component;

		return module;
	}


	function getComponent(name) {
		if (!registeredComponents.hasOwnProperty(name)) {
			main.throwError("Component not registered.", {name: name});
		}

		return registeredComponents[name];
	}

	function handleMakeComponent(line, element) {
		var parts = line.split(componentRegex);

		if (parts.length !== 6) {
			main.throwError("Cannot parse component assignment. Invalid property syntax.", {
				line: line,
				element: element
			});
		}

		var referenceAs = parts[3] ? parts[3] : null;
		var assignOperations = parts[4] ? assignments.parse(parts[4]) : [];

		var parent = containerManager.findParentElement(element);
		var parentContainer = containerManager.ensure(parent);
		var container = containerManager.ensure(element, parent);

		var props = {};
		var events = container.events;

		var componentClass = getComponent(parts[1]);
		var component = new componentClass(props, element);

		events.beforeRender = createEvent(component);
		events.afterRender = createEvent(component);
		events.beforeLink = createEvent(component);
		events.afterLink = createEvent(component);
		events.beforeUnlink = createEvent(component);
		events.afterUnlink = createEvent(component);
		events.beforeInitialize = createEvent(component);
		events.afterInitialize = createEvent(component);

		component.__proto__ = main.mergeConfig(false, {
			props: props,
			element: element,
			reload: reloadElement,
			set: setProperty,
			setProps: setProperties,
			reloadProperty: reloadProperty,
			renderDisabled: false,
			disableRender: disableRender,
			enableRender: enableRender,
			container: container
		}, component.__proto__);

		container.payload = component;
		container.registerPropertyResolver = registerPropertyResolver;

		if (referenceAs) {
			parentContainer.scope[referenceAs] = container;
		}

		containerManager.relink(container);
		var mappedProperties = {};

		var hooks = container.hooks;

		hooks.onRender = renderComponent;
		hooks.onLink = hookOnLink;
		hooks.onUnlink = hookOnUnlink;

		function registerPropertyResolver(propertyName, resolver) {
			if (!mappedProperties[propertyName]) {
				mappedProperties[propertyName] = [];
			}

			mappedProperties[propertyName].push(resolver);
		}

		function reloadProperty(propertyName) {
			if (!(propertyName in mappedProperties)) {
				return;
			}

			var property = mappedProperties[propertyName];
			
			for (var i = 0; i < property.length; i++) {
				property[i].apply(component);
			}
		}

		function setProperty(propertyName, value) {
			component.props[propertyName] = value;
			reloadProperty(propertyName);
		}

		function setProperties(properties) {
			var reloadProps = [];
			for(var prop in properties) {
				if (!properties.hasOwnProperty(prop)) {
					continue;
				}

				component.props[prop] = properties[prop];
				reloadProps.push(prop);
			}

			for(var i = 0; i < reloadProps.length; i++) {
				reloadProperty(reloadProps[i]);
			}
		}

		function reloadElement() {
			parser.parse(element);
		}

		function renderComponent() {
			if (!component.template || component.renderDisabled) {
				return;
			}

			html.setContents(element, component.template);
			component.template = element.children;

			disableRender();
			parser.parse(element);
			enableRender();
		}

		function hookOnLink() {
			assignments.assign(container, parentContainer.scope, assignOperations);
			component.afterLink && component.afterLink.trigger();

			var scope = {};
			for (var scopeName in container.scope) {
				if (!container.scope.hasOwnProperty(scopeName)) {
					continue;
				}

				scope[scopeName] = container.scope[scopeName].payload;
			}

			events.beforeInitialize.trigger(scope, events);
			component.initialize && component.initialize(scope, events);
			events.afterInitialize.trigger(scope, events);
		}

		function hookOnUnlink() {
			component.destroy && component.destroy();
		}

		function disableRender() {
			component.renderDisabled = true;
		}

		function enableRender() {
			component.renderDisabled = false;
		}
	}
});