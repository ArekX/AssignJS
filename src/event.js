(function(core) {
    "use strict";
    
    core.modules.define("core.event", EventsModule);

    function EventsModule() {
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
            this.afterTriggerCallback = callback.bind(this.context);
        }

        function registerEvent(eventNamespace, callback) {
            if (core.vars.isFunction(callback)) {
                this.registerNamed(eventNamespace, callback);
                return;
            }

            this.unnamedListeners.push(eventNamespace.bind(this.context));
        }

        function registerNamedEvent(eventNamespace, callback) {
            core.assert.namespaceValid(eventNamespace);
            core.assert.keyNotSet(eventNamespace, this.namedListeners, "Event namespace is already defined.");

            this.namedListeners[eventNamespace] = callback.bind(this.context);
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

        function triggerEvents(data) {
            for(var eventNamespace in this.namedListeners) {
                if (this.namedListeners.hasOwnProperty(eventNamespace)) {
                    if (this.namedListeners[eventNamespace](data) === false) {
                        return false;
                    }
                }
            }

            for(var i = 0; i < this.unnamedListeners.length; i++) {
                if (this.unnamedListeners[i](data) === false) {
                    return false;
                }
            }

            if (this.afterTriggerCallback) {
                return this.afterTriggerCallback(data);
            }

            return true;
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);