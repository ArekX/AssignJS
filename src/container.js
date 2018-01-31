(function(core) {
	core.modules.define("core.container.manager", ContainerManagerModule);

	ContainerManagerModule.deps = ["core.parser", "core.manager.base"];

	function ContainerManagerModule(parser, managerMaker) {
		parser.events.afterParseAll.register("core.container.manager", function() {

		});

		function ContainerManager() {
			this.trackId = 0;
			this.types = {};
			this.containers = {};
		}

		ContainerManager.prototype = managerMaker();
		ContainerManager.prototype.findParentContainer = findParentContainer;
		ContainerManager.prototype.wrapElement = wrapElement;
		ContainerManager.prototype.create = createContainer;
		ContainerManager.prototype._getNewTrackId = getNewTrackId;

		return new ContainerManager();

		function createContainer(type, payload, parentScope) {
			var type = this.get(type);
			var trackId = this._getNewTrackId();
			var instance = new type(trackId, payload, parentScope);

			return this.containers[trackId] = instance;
		}

		function wrapElement(element, type, payload) {
			 var parentElement = findParentContainer(element);
			 var parentScope = parentElement ? parentElement.$container.scope : null;

			 var container = this.create(type, payload, parentScope);
			 
			 container.owner = element;

			 return container;
		}

		function getNewTrackId() {
			return this.trackId++;
		}

		function findParentContainer(element) {
			var parent = element.parentElement;

			while(parent !== null) {
				if (parent.$container) {
					return parent;
				}

				parent = parent.parentElement;
			}

			return null;
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);