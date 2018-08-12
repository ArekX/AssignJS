// @import: core/object.js
// @import: core/assert.js
// @import: core/inspect.js

lib(['object', 'assert', 'inspect'], function(object, assert, inspect) {
    var Factory = {
        _types: null,
        _conflictHandler: null,
        _replaceHandler: null,
        _defaultType: null,
        init: initFactory,
        add: addType,
        replace: replaceType,
        create: createType,
        createDefault: createDefaultType,
        setConflictHandler: setConflictHandler,
        setReplaceHandler: setReplaceHandler,
        setDefaultType: setDefaultType
    };

    this.createFactory = createFactory;

    function createFactory() {
        return object.create(Factory);
    }

    function initFactory() {
        this._types = {};
    }

    function setConflictHandler(handler) {
        this._conflictHandler = handler;
    }

    function setReplaceHandler(handler) {
        this._replaceHandler = handler;
    }

    function setDefaultType(type) {
        assert.keySet(type, this._types, 'This type is not set!', {type: type, types: this._types});
        this._defaultType = type;
    }

    function addType(type, maker) {
        if ((type in this._types) && this._conflictHandler) {
            this._conflictHandler(type, maker, this._types);
            return;
        }

        assert.keyNotSet(type, this._types, 'This type is already set!', {type: type, types: this._types});
        this._types[type] = maker;
    }

    function replaceType(type, newMaker) {
        assert.keySet(type, this._types, 'This type is not set!', {type: type, types: this._types});

        if (this._replaceHandler) {
            newMaker = this._replaceHandler(type, newMaker, this._types[type], this._types);
            return;
        }

        this._types[type] = newMaker;
    }

    function createType(type, args) {
        assert.keySet(type, this._types, 'This type is not set!', {type: type, types: this._types});
        var type = this._types[type];

        if (inspect.isFunction(type)) {
            return type.apply(type, args);
        }

        return object.create(type, args);
    }

    function createDefaultType(args) {
        assert.notEqual(this._defaultType, null, 'Default type is not defined!', {args: args});
        return this.create(this._defaultType, args);
    }
});
