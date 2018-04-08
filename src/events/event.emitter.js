// @import: core
// @import: events/base.js

"use strict";

lib(['events', 'assert', 'object'], function(events, assert, object) {

    var EventEmitter = {
        init: init,
        register: registerEvent,
        unregister: unregisterEvent,
        setAfterRun: setAfterRunTrigger,
        trigger: triggerEvent
    };

    events.factory.add('base', EventEmitter);

    function init(context) {
        this._namedListeners = {};
        this._listeners = [];
        this._context = null;
        this._afterTriggerRun = null;
        this._originalListeners = [];
        this._context = context;
    }

    function registerEvent(callback, eventName) {
        var reboundCallback = callback.bind(this._context);
        if (eventName) {
            assert.keyNotSet(eventName, this._namedListeners);
            this._namedListeners[eventName] = reboundCallback;
            return;
        }

        if (this._originalListeners.indexOf(callback) === -1) {
            this._listeners.push(reboundCallback);
            this._originalListeners.push(callback);
        }
    }

    function unregisterEvent(callback, eventName) {
        if (eventName in this._namedListeners) {
            delete this._namedListeners[eventName];
        }

        var listenerIndex = this._originalListeners.indexOf(callback);

        if (listenerIndex !== -1) {
            this._listeners.splice(listenerIndex, 1);
            this._originalListeners.splice(listenerIndex, 1);
        }
    }

    function setAfterRunTrigger(callback) {
        this._afterTriggerRun = callback;
    }

    function triggerEvent(data) {
        var breakResult = null;
        for(var i = 0; i < this._listeners.length; i++) {
            breakResult = this._listeners[i](data);

            if (breakResult === false) {
                return false;
            }
        }

        for(var name in this._namedListeners) {
            if (!this._namedListeners.hasOwnProperty(name)) {
                continue;
            }

            breakResult = this._namedListeners[name](data);

            if (breakResult === false) {
                return false;
            }
        }

        if (this._afterTriggerRun) {
            return this._afterTriggerRun(data);
        }

        return true;
    }
    
});