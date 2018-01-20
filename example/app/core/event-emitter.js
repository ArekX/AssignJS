document.querySelector('script[data-assign-js]').$main.set(
	"core.events.emitter", 
	[], 
function() {
	var main = this.main;
	
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

	return function(context) {
		return new EventEmitter(context);
	};

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
		main.assertValidNamespace(eventNamespace);

		if (eventNamespace in this.namedListeners) {
			main.throwError("Event namespace is already defined.", {eventNamespace: eventNamespace, callback: callback});
		}

		this.namedListeners[eventNamespace] = callback;
	}

	function unregisterEvent(event) {
		var unnamedIndex = this.unnamedListeners.indexOf(event);
		if (typeof event === "function" && unnamedIndex !== -1) {
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
});