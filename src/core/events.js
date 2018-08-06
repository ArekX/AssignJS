// import: core/object.js

lib(['object'], function EventsCore(object) {
    var Emitter = {
        _callId: null,
        _calls: {},
        _context: null,
        init: initEvent,
        register: registerCall,
        trigger: triggerAll
    };

    this.events = {
        create: createEvent,
        createGroup: createEventGroup
    };

    function createEvent(context) {
        return object.create(Emitter, [context]);
    }

    function createEventGroup(list, context) {
        var events = {};
        for(var i = 0; i < list.length; i++) {
            events[list[i]] = createEvent(context);
        }

        return events;
    }

    function initEvent(context) {
        this._context = context;
        this._callId = 0;
    }

    function registerCall(call) {
        var calls = this._calls;
        var callId = this._callId++;

        calls[callId] = call.bind(this._context);

        return function() {
            delete calls[callId];
        };
    }

    function triggerAll(data) {
        for(var callId in this._calls) {
            if (this._calls.hasOwnProperty(callId)) {
               if (this._calls[callId](data) === false) {
                  return false;
               }
            }
        }

        return true;
    }
});
