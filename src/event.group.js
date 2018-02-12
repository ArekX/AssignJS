(function(core) {
    "use strict";
    
    core.modules.define("core.event.group", EventGroupModule);
    var assert = core.assert;

    EventGroupModule.deps = ['core.event'];

    function EventGroupModule(makeEventEmitter) {
        function EventGroup(eventList, context) {
            this._events = {};
            this._context = context;
            this.extend(eventList);
        }

        EventGroup.prototype.extend = extendList;
        EventGroup.prototype.register = registerEvent;
        EventGroup.prototype.unregister = unregisterEvent;
        EventGroup.prototype.trigger = triggerEvent;
        EventGroup.prototype._assertEventDefined = assertEventDefined;

        return function(eventList, context) {
            return new EventGroup(eventList, context);
        }

        function assertEventDefined(eventName) {
            assert.ownKeySet(eventName, this._events, 'Event is not defined.', {
                eventName: eventName
            });
        }

        function extendList(eventList) {
             for(var i = 0; i < eventList.length; i++) {
                var event = eventList[i];
                assert.ownKeyNotSet(event, this._events, 'This event is already defined.', {event: event});
                this._events[event] = null;
             }
        }

        function registerEvent(eventName, namespace, callback) {
            this._assertEventDefined(eventName);

            if (this._events[eventName] === null) {
                this._events[eventName] = makeEventEmitter(this._context);
            }

            this._events[eventName].register(namespace, callback);
        }

        function unregisterEvent(eventName, namespace, callback) {
            this._assertEventDefined(eventName);

            if (this._events[eventName] === null) {
                return;
            }

            this._events[eventName].unregister(namespace, callback);
        }

        function triggerEvent(eventName, data) {
            this._assertEventDefined(eventName);

            if (this._events[eventName] === null) {
                return true;
            }

            return this._events[eventName].trigger(data);
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);