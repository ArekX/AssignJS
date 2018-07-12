// @import: core
// @import: events/base.js

lib(['events', 'assert', 'object'], function EventsGroup(events, assert, object) {
    
    var EventGroup = {
        init: init,
        extend: extendList,
        register: registerEvent,
        on: registerEvent,
        unregister: unregisterEvent,
        trigger: triggerEvent,
        _assertEventDefined: assertEventDefined,
    };

    events.createGroup = createGroup;

    function createGroup(eventList, context, baseType) {
        return object.create(EventGroup, [eventList, context, baseType]);
    }

    function init(eventList, context, baseType) {
        this._events = {};
        this._context = context;
        this._baseType = baseType || 'base';
        this.extend(eventList);
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

    function registerEvent(eventName, callback, name) {
        this._assertEventDefined(eventName);

        if (this._events[eventName] === null) {
            this._events[eventName] = events.factory.create(this._baseType, this._context);
        }

        this._events[eventName].register(callback, name);
    }

    function unregisterEvent(eventName, callback, name) {
        this._assertEventDefined(eventName);

        if (this._events[eventName] === null) {
            return;
        }

        this._events[eventName].unregister(callback, name);
    }

    function triggerEvent(eventName, data) {
        this._assertEventDefined(eventName);

        if (this._events[eventName] === null) {
            return true;
        }

        return this._events[eventName].trigger(data);
    }

});