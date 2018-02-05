(function(core) {
    "use strict";

    core.modules.define("core.scope", ScopeModule);

    ScopeModule.deps = [];

    function ScopeModule() {
        var scopeTrackId = 1;

        function Scope() {
            this._trackId = scopeTrackId++;
            this._items = {};
            this._children = {};
            this._isDestroyed = false;
            this._parentScope = null;
        }

        Scope.prototype.set = setItemToScope;
        Scope.prototype.unset = unsetItemFromScope;
        Scope.prototype.assign = assignItemToScope;
        Scope.prototype.assignMultiple = assignMultipleItemsToScope;
        Scope.prototype.get = getItemFromScope;
        Scope.prototype.setParent = setParentScope;
        Scope.prototype.getParent = getParentScope;
        Scope.prototype.getChildren = getChildrenScopes;
        Scope.prototype.exists = existsInScope;
        Scope.prototype.isOwnerOf = isInOwnScope;
        Scope.prototype.isRoot = isRootScope;
        Scope.prototype.destroy = destroyScope;
        Scope.prototype._setChild = registerChildScope;
        Scope.prototype._unsetChild = unregisterChildScope;
        Scope.prototype._assertNotDestroyed = assertNotDestroyed;

        return function(parentScope) {
            return new Scope(parentScope);
        };

        function assertNotDestroyed() {
            if (this._isDestroyed) {
                core.throwError('Cannot perform this action on destroyed scope.', {});
            }
        }

        function destroyScope() {
            this._assertNotDestroyed();

            if (this._parentScope) {
                this._parentScope._unsetChild(this);
            }

            this._isDestroyed = true;
        }

        function setParentScope(scope) {
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
            core.assert.keySet(this._children, scope._trackId, 'This scope is not defined as a child.');
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

            core.assert.ownKeyNotSet(name, this._items, 'This item is already defined in scope.');
            this._items[name] = item;
        }

        function unsetItemFromScope(name) {
            this._assertNotDestroyed();
            core.assert.keySet(this._items, name, 'This item is not defined in scope.');
            delete this._items[name];
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

            core.assert.keySet(name, this._items, 'This item is not defined in scope.');
            return this._items[name];
        }

        function isInOwnScope(name) {
            this._assertNotDestroyed();

            return this._items.hasOwnProperty(name);
        }

        function isRootScope() {
            return this.getParent() === null;
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);