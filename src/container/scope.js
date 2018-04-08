// @import: core
// @import: container/base.js

"use strict";

lib(['events', 'container', 'object', 'throwError', 'assert'], function(events, containerManager, object, throwError, assert) {
    var trackId = 1;

    var Scope = {
        init: initialize,
        set: setItemToScope,
        unset: unsetItemFromScope,
        assign: assignItemToScope,
        assignMultiple: assignMultipleItemsToScope,
        get: getItemFromScope,
        getGlobal: getGlobalItemFromScope,
        getAll: getAllItems,
        setParent: setParentScope,
        getParent: getParentScope,
        getChildren: getChildrenScopes,
        exists: existsInScope,
        isOwnerOf: isInOwnScope,
        isRoot: isRootScope,
        destroy: destroyScope,
        isDestroyed: getIsDestroyed,
        _setChild: registerChildScope,
        _unsetChild: unregisterChildScope,
        _assertNotDestroyed: assertNotDestroyed
    };

    containerManager.createScope = createScope;
    containerManager.rootScope = createScope([null]);

    function createScope(parentScope) {
        return object.create(Scope, [parentScope]);
    }

    function initialize(parentScope) {
        this._trackId = trackId++;
        this._items = {};
        this._children = {};
        this._isDestroyed = false;
        this._parentScope = parentScope || null;

        this.events = events.createGroup([
            'itemSet', 
            'itemUnset'
        ], this);
    }

    function assertNotDestroyed() {
        if (this._isDestroyed) {
            throwError('Cannot perform this action on destroyed scope.', {});
        }
    }

    function destroyScope() {
        if (this.isDestroyed()) {
            return;
        }

        if (this._parentScope) {
            this._parentScope._unsetChild(this);
        }

        this._isDestroyed = true;
    }

    function getIsDestroyed() {
        return this._isDestroyed;
    }

    function setParentScope(scope) {
        if (scope === null) {
            scope = rootScope;
        }

        if (this._parentScope) {
            this._parentScope._unsetChild(this);
            this._items.__proto__ = {};
        }

        if (scope) {
            this._items.__proto__ = scope._items;
            scope._setChild(this);
        }

        this._parentScope = scope;
    }

    function getParentScope() {
        this._assertNotDestroyed();
        return this._parentScope;
    }

    function registerChildScope(scope) {
        this._assertNotDestroyed();
        this._children[scope._trackId] = scope;
    }

    function unregisterChildScope(scope) {
        this._assertNotDestroyed();
        assert.keySet(scope._trackId, this._children, 'This scope is not defined as a child.');
        delete this._children[scope._trackId];
    }

    function getChildrenScopes() {
        this._assertNotDestroyed();

        var data = [];

        for(var item in this._children) {
            if (this._children.hasOwnProperty(item)) {
                data.push(this._children[item]);
            }
        }

        return data;
    }

    function setItemToScope(name, item) {
        this._assertNotDestroyed();
        assert.ownKeyNotSet(name, this._items, 'This item is already defined in scope.');
        this._items[name] = item;

        this.events.trigger('itemSet', {
            name: name,
            item: item
        });
    }

    function unsetItemFromScope(name) {
        this._assertNotDestroyed();
        assert.keySet(name, this._items, 'This item is not defined in scope.');
        var item = this._items[name];
        
        delete this._items[name];

        this.events.trigger('itemUnset', {
            name: name,
            item: item
        });
    }

    function assignItemToScope(name, item) {
        this._assertNotDestroyed();

        if (this.isOwnerOf(name)) {
            return;
        }

        this.set(name, item);
    }

    function assignMultipleItemsToScope(items) {
        this._assertNotDestroyed();

        for(var item in items) {
            if (items.hasOwnProperty(item)) {
                this.assign(items[item]);
            }
        }
    }

    function existsInScope(name) {
        this._assertNotDestroyed();

        return name in this._items;
    }

    function getItemFromScope(name) {
        this._assertNotDestroyed();
        assert.ownKeySet(name, this._items, 'This item is not defined in local scope.');
        return this._items[name];
    }

    function getGlobalItemFromScope(name) {
        this._assertNotDestroyed();

        assert.keySet(name, this._items, 'This item is not defined in global scope.');
        return this._items[name];
    }

    function getAllItems() {
        return core.vars.merge(false, {}, this._items);
    }

    function isInOwnScope(name) {
        this._assertNotDestroyed();

        return this._items.hasOwnProperty(name);
    }

    function isRootScope() {
        return this === container.rootScope;
    }
});