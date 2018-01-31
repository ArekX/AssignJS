(function(core) {
	core.modules.define("core.manager.base", ManagerBaseModule);

	ManagerBaseModule.deps = [];

	function ManagerBaseModule() {
		
		function ManagerBase() {
			this.types = {};
		}

		ManagerBase.prototype.define = defineType;
		ManagerBase.prototype.get = getType;

		return function() {
			return new ManagerBase();
		};

		function defineType(type, factory) {
			core.assert.keyNotSet(type, this.types, 'This type is already defined.');
			this.types[type] = factory;
		}

		function getType(type) {
			core.assert.keySet(type, this.types, 'This type is not defined.');
			return this.types[type];
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);