(function(core) {
	core.modules.extend("core.container.manager", ContainerManagerExtender);

	ContainerManagerExtender.deps = ["core.scope"];

	function ContainerManagerExtender(makeScope) {
		this.module.define("core.base", BaseContainer);
	
		function BaseContainer(trackId, payload, parentScope) {
			this.payload = payload;
			this.trackId = trackId;
			this._parentContainer = null;
			this.events = {
				beforeLink: null,
				afterLink: null,
				afterUnlink: null
			};

			this.scope = makeScope();
		}

		BaseContainer.prototype.setParent = setParentContainer;
		BaseContainer.prototype.getParent = getParentContainer;
		BaseContainer.prototype.owner = null;
		BaseContainer.prototype.link = linkContainer;
		BaseContainer.prototype.unlink = unlinkContainer;
		BaseContainer.prototype.triggerEvent = triggerEvent;

		function linkContainer(linkItems) {
			this.triggerEvent('beforeLink', linkItems);
			this.scope.assignMultiple(linkItems);
			this.triggerEvent('afterLink');
		}

		function unlinkContainer() {
			this.triggerEvent('afterUnlink');
		}

		function setParentContainer(container) {
			this._parentContainer = container;

			if (container) {
				this.scope.setParent(container.scope);
			} else {
				this.scope.setParent(null);
			}
		}

		function getParentContainer() {
			return this._parentContainer;
		}

		function triggerEvent(name, data) {
			if (this.events[name]) {
				this.events[name].trigger(data);
			}
		}
	}

})(document.querySelector('script[data-assign-js-core]').$main);