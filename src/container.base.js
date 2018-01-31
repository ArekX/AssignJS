(function(core) {
	core.modules.extend("core.container.manager", ContainerManagerExtender);

	ContainerManagerExtender.deps = ["core.scope"];

	function ContainerManagerExtender(makeScope) {
		this.module.define("base", BaseContainer);
	
		function BaseContainer(trackId, payload, parentScope) {
			this.payload = payload;
			this.trackId = trackId;
			this.events = {
				beforeLink: null,
				afterLink: null,
				afterUnlink: null
			};

			this.scope = makeScope(parentScope);
		}

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

		function triggerEvent(name, data) {
			if (this.events[name]) {
				this.events[name].trigger(data);
			}
		}
	}

})(document.querySelector('script[data-assign-js-core]').$main);