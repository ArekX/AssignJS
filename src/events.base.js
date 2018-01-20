(function(core) {
	core.modules.extend("core.events", EventExtender);

	function EventExtender() {
		var module = this.module;
		this.module.registerType("base", EventEmitter);
	}

	function EventEmitter(context) {
		this.namedListeners = {};
		this.unnamedListeners = [];
		this.context = context;
		this.afterTriggerCallback = null;
	}

	EventEmitter.prototype.register = registerEvent;
	EventEmitter.prototype.registerNamed = registerNamedEvent;
	EventEmitter.prototype.unregister = unregisterEvent;
	EventEmitter.prototype.trigger = triggerEvents;
	EventEmitter.prototype.setAfterTrigger = setAfterTrigger;

	function setAfterTrigger(callback) {
		this.afterTriggerCallback = callback;
	}

	function registerEvent(eventNamespace, callback) {
		if (typeof callback === "function") {
			this.registerNamed(eventNamespace, callback);
			return;
		}

		this.unnamedListeners.push(eventNamespace);
	}

	function registerNamedEvent(eventNamespace, callback) {
		core.assert.namespaceValid(eventNamespace);
		core.assert.keyNotSet(eventNamespace, this.namedListeners, "Event namespace is already defined.");

		this.namedListeners[eventNamespace] = callback;
	}

	function unregisterEvent(event) {
		var unnamedIndex = this.unnamedListeners.indexOf(event);
		if (core.vars.isFunction(event) && unnamedIndex !== -1) {
			this.unnamedListeners.splice(unnamedIndex, 1);
			return;
		}

		if (event in this.namedListeners) {
			delete this.namedListeners[event];
		}
	}

	function triggerEvents() {
		for(var eventNamespace in this.namedListeners) {
			if (this.namedListeners.hasOwnProperty(eventNamespace)) {
				var shouldContinue = this.namedListeners[eventNamespace].apply(this.context, arguments);

				if (shouldContinue === false) {
					return false;
				}
			}
		}

		for(var i = 0; i < this.unnamedListeners.length; i++) {
			var shouldContinue = this.unnamedListeners[i].apply(this.context, arguments);

			if (shouldContinue === false) {
				return false;
			}
		}

		this.afterTriggerCallback && this.afterTriggerCallback.apply(this, arguments);
	}
})(document.querySelector('script[data-assign-js-core]').$main);