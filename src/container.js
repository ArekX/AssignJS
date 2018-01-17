document.querySelector('script[data-assign-js]').$main.set(
	"core.container", 
	["core.parser"], 
function(parser) {
	var main = this.main;
	var trackCounter = 1;
	var trackedItems = {};
	var containersToLink = [];

	parser.events.afterParse.register("core.container.run", processAfterParse);
	parser.events.afterParse.register("core.container.render", renderContainers);

	return {
		create: createContainer,
		ensure: ensureContainer,
		relink: relinkContainer,
		linkContainers: linkContainers,
		checkTrackedContainers: checkTrackedContainers,
		findParentElement: findParentElement,
		unlinkElement: unlinkElement
	};

	function createContainer(element, parent, containerConfig) {

		parent = parent || null;
		containerConfig = containerConfig || {};

		if (element.$container) {
			main.throwError("Container is already defined for this element.", {element: element});
		}

		var scope = {};

		if (parent && parent.$container) {
			scope.__proto__ = parent.$container.scope;
		}

		var item = {
			trackId: trackCounter++,
			isUnlinking: false,
			isUnlinked: false,
			element: element,
			parent: parent,
			scope: scope,
			render: renderContainer,
			unlink: unlinkContainer,
			link: linkContainer,
			hooks: {
				onLink: null,
				onUnlink: null,
				onRender: null
			},
			events: {
				beforeLink: null,
				afterLink: null,
				beforeRender: null,
				afterRender: null,
				beforeUnlink: null,
				afterUnlink: null
			},
			payload: null
		};

		item = main.mergeConfig(item, containerConfig);

		trackedItems[item.trackId] = item;
		element.$container = item;

		relinkContainer(item);

		return item;

		function unlinkContainer() {
			if (item.isUnlinking) {
				return;
			}

			var events = item.events;

			item.isUnlinking = true;

			events.beforeUnlink && events.beforeUnlink.trigger();
			item.hooks.onUnlink && item.hooks.onUnlink();
			events.afterUnlink && events.afterUnlink.trigger();

			item.isUnlinked = true;
		}

		function linkContainer() {
			var events = item.events;

			events.beforeLink && events.beforeLink.trigger();
			item.hooks.onLink && item.hooks.onLink();
			events.afterLink && events.afterLink.trigger();
		}

		function renderContainer() {
			var events = item.events;

			events.beforeRender && events.beforeRender.trigger();
			item.hooks.onRender && item.hooks.onRender();
			events.afterRender && events.afterRender.trigger();
		}
	}

	function ensureContainer(element, parent, containerConfig) {
		containerConfig = containerConfig || {};
		return !element.$container ? createContainer(element, parent, containerConfig) : element.$container;
	}

	function processAfterParse() {
		linkContainers();
		checkTrackedContainers();
	}

	function linkContainers() {
		while(containersToLink.length > 0) {
			var container = containersToLink.pop();
			container.link();
		}
	}

	function findParentElement(element) {
		if (element === document.head.parentElement) {
			return element;
		}

		if (element.$container) {
			return element.$container.parent;
		}

		var parent = element.parentElement;

		while(parent !== null) {
			if (parent.$container) {
				return parent;
			}

			parent = parent.parentElement;
		}

		if (element.parentElement === null) {
			main.throwError("No matching parent found.", {element: element});
		}

		return element.parentElement;
	}

	function relinkContainer(container) {
		if (containersToLink.indexOf(container) == -1) {
			containersToLink.push(container);
		}
	}

	function renderContainers(parent) {
		if (parent.$container) {
			renderContainer(parent.$container);
		}

		for(var i = 0; i < parent.children.length; i++) {
			var child = parent.children[i];
			var container = child.$container;

			renderContainers(child);
		}

		function renderContainer(container) {
			container.render();
		}
	}

	function checkTrackedContainers() {
		for(var trackId in trackedItems) {
			if (!trackedItems.hasOwnProperty(trackId)) {
				continue;
			}

			var trackedItem = trackedItems[trackId];
			var element = trackedItem.element;
			var parent = element.parentElement;

			while(parent !== null) {
				if (parent === document.body.parentElement) {
					break;
				}
				
				parent = parent.parentElement;
			}

			if (parent === null && element !== document.body.parentElement) {
				unlinkElement(element);
			}
		}
	}

	function unlinkElement(element) {

		for(var i = 0; i < element.children.length; i++) {
			var child = element.children[i];
			element.removeChild(child);
			unlinkElement(child);
		}

		element.parentElement = null;

		var container = element.$container;
		
		if (!container) {
			return;
		}

		container.unlink();

		delete trackedItems[container.trackId];
	}
});