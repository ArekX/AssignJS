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
		ContainerManager.prototype.create = createContainer;
		ContainerManager.prototype._getNewTrackId = getNewTrackId;

		return new ContainerManager();

		function createContainer(type, payload, parentScope) {
			var type = this.get(type);
			var trackId = this._getNewTrackId();
			var instance = new type(trackId, payload, parentScope);

			return this.containers[trackId] = instance;
		}

		function getNewTrackId() {
			return this.trackId++;
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);