(function(core) {
	core.modules.define("core.events", EventsModule);

	EventsModule.deps = [];

	function EventsModule() {
		var assert = core.assert;

		function Events() {
			this.types = {};
		}

		Events.prototype.create = createEvent;
		Events.prototype.getType = getType;
		Events.prototype.registerType = registerEventType;

		return new Events();

		function createEvent(type, context, options) {
			var event = this.getType(type);
			return new event(context, options);
		}

		function registerEventType(type, initializer) {
			assert.keyNotSet(type, this.types, 'This event type is already defined.');
			this.types[type] = initializer;
		}


		function getType(type) {
			assert.keySet(type, this.types, 'This event type is not defined.');
			return this.types[type];
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);