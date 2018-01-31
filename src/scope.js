(function(core) {
	core.modules.define("core.scope", ScopeModule);

	ScopeModule.deps = [];

	function ScopeModule() {
		function Scope(parentScope) {
			this._items = {};

			if (parentScope) {
				this._items.__proto__ = parentScope._items;
			}
		}

		Scope.prototype.set = setItemToScope;
		Scope.prototype.assign = assignItemToScope;
		Scope.prototype.assignMultiple = assignMultipleItemsToScope;
		Scope.prototype.get = getItemFromScope;
		Scope.prototype.isOwnerOf = isInOwnScope;

		return function(parentScope) {
			return new Scope(parentScope);
		};

		function setItemToScope(name, item) {
			core.assert.ownKeyNotSet(this.items, name, 'This item is already defined in scope.');
			this._items[name] = item;
		}

		function assignItemToScope(name, item) {
			if (this.isOwnerOf(name)) {
				return;
			}

			this.set(name, item);
		}

		function assignMultipleItemsToScope(items) {
			for(var item in items) {
				if (items.hasOwnProperty(item)) {
					this.assign(items[item]);
				}
			}
		}

		function getItemFromScope(name) {
			core.assert.keySet(this.items, name, 'This item is not defined in scope.');
			return this._items[name];
		}

		function isInOwnScope(name) {
			return this._items.hasOwnProperty(name);
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);