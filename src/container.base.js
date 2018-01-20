(function(core) {
	core.modules.extend("core.container.manager", ContainerManagerExtender);

	ContainerManagerExtender.deps = ["core.events"];

	function ContainerManagerExtender(events) {
		var module = this.module;
		this.module.define("base", ContainerBase);
	}

	function ContainerBase(trackId, payload) {
		this.payload = payload;
		this.trackId = trackId;
	}

	ContainerBase.prototype.onLink = handleOnLink;
	ContainerBase.prototype.onUnlink = handleOnUnlink;

	function handleOnLink() {

	}

	function handleOnUnlink() {

	}

})(document.querySelector('script[data-assign-js-core]').$main);