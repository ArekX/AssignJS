(function(core) {
	core.modules.define("core.container.manager", ContainerManagerModule);

	ContainerManagerModule.deps = ["core.parser"];

	function ContainerManagerModule(parser) {
		parser.events.afterParseAll.register("core.container.manager", function() {

		});

		function ContainerManager() {
			this.trackId = 0;
			this.types = {};
			this.containers = {};
		}

		ContainerManager.prototype.define = defineContainer;
		ContainerManager.prototype.get = getContainer;
		ContainerManager.prototype.create = createContainer;
		ContainerManager.prototype._getNewTrackId = getNewTrackId;

		return new ContainerManager();

		function defineContainer(type, container) {
			core.assert.keyNotSet(type, container, 'This container is already defined.')
			this.types[type] = container;
		}

		function createContainer(type, payload) {
			var type = this.get(type);
			var trackId = this._getNewTrackId();
			var instance = new type(trackId, payload);

			return this.containers[trackId] = instance;
		}

		function getContainer(type) {
			core.assert.keySet(type, this.types, 'This container is not defined.');
			return this.types[type];
		}

		function getNewTrackId() {
			return this.trackId++;
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);