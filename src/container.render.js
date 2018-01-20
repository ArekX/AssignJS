(function(core) {
	core.modules.extend("core.container.manager", ContainerManagerExtender);

	ContainerManagerExtender.deps = ["core.events"];

	function ContainerManagerExtender(events) {
		var module = this.module;
		var base = this.module.get("base");

		this.module.define("render", ContainerRender);

		function ContainerRender(trackId, payload) {
			this.events = {
				beforeInit: events.create("base", this),
				afterInit: events.create("base", this),
				beforeRender: events.create("base", this),
				afterRender: events.create("base", this),
				beforeLink: events.create("base", this),
				afterLink: events.create("base", this),
				afterDestroy: events.create("base", this)
			};
			// consider nulls for lighter containers.
			this.trackId = trackId;
			this.payload = payload;
		}

		ContainerRender.render.prototype = base;

		ContainerRender.onLink = handleOnLink;
		ContainerRender.onLink = handleOnUnlink;

		function handleOnLink() {
			this.events.beforeLink.trigger();
			this.events.afterLink.trigger();
		}

		function handleOnUnlink() {
			this.events.afterDestroy.trigger();
		}

	}
})(document.querySelector('script[data-assign-js-core]').$main);