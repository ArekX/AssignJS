(function(core) {
	function Modules() {
		this._modules = {};
		this._definitions = {};
		this._runnables = {};
		this._extensions = {};
		this.initialized = false;
	}

	Modules.prototype.define = defineModule;
	Modules.prototype.extend = extendModule;
	Modules.prototype.defineRunnable = defineRunnable;
	Modules.prototype.as = asModule;
	Modules.prototype._initializeModule = initializeModule;
	Modules.prototype._initializeExtensions = initializeExtensions;
	Modules.prototype._getModules = getModules;
	Modules.prototype._runAll = runAll;
	Modules.prototype._runRunnables = runRunnables;
	Modules.prototype._initializeAllModules = initializeAllModules;

	var modules = new Modules();
	var assert = core.assert;

	core.modules = modules;
	core.addRunnable(function() {
		modules._runAll();
	});

	return;

	function defineModule(namespace, dependencies, initializer) {
		assert.namespaceValid(namespace);
		assert.keyNotSet(namespace, this._definitions, 'This module is already defined.');

		if (!initializer) {
			initializer = dependencies;
		}

		initializer.deps = initializer.deps || dependencies; 
		this._definitions[namespace] = initializer;

	}

	function extendModule(namespace, dependencies, extender) {
		if (!(namespace in this._extensions)) {
			this._extensions[namespace] = [];
		}

		if (!extender) {
			extender = dependencies;
		}

		extender.deps = extender.deps || dependencies; 

		this._extensions[namespace].push(extender);
	}

	function defineRunnable(namespace, initializer) {
		assert.namespaceValid(namespace);
		assert.keyNotSet(namespace, this._runnables, 'This runnable is already defined.');
		this._runnables[namespace] = initializer;
	}

	function runAll() {
		this.initialized = true;
		this._initializeAllModules();
		this._runRunnables();
	}

	function initializeAllModules() {
		for(var namespace in this._definitions) {
			if (this._definitions.hasOwnProperty(namespace)) {
				this.as(namespace);
			}
		}
	}

	function runRunnables() {
		for(var namespace in this.runnables) {
			if (!this.runnables.hasOwnProperty(namespace)) {
				continue;
			}

			this.runnables[namespace]();
		}
	}

	function asModule(namespace) {
		if (!this.initialized) {
			core.throwError("Assign JS modules is not initialized!", {namespace: namespace});
		}

		if (namespace in this._modules) {
			return this._modules[namespace];
		}

		return this._initializeModule(namespace);
	}

	function initializeModule(namespace) {
		assert.keySet(namespace, this._definitions, 'Module is not defined.');

		var initializer = this._definitions[namespace];

		var context = {
			core: core,
			name: namespace,
			deps: initializer.deps
		};

		var dependencies = this._getModules(initializer.deps);
		context.module = this._modules[namespace] = initializer.apply(context, dependencies);

		this._initializeExtensions(namespace, context);

		return context.module;
	}

	function initializeExtensions(namespace, context) {

		if (!(namespace in this._extensions)) {
			return;
		}

		for(var i = 0; i < this._extensions[namespace].length; i++) {
			var extender = this._extensions[namespace][i];
			extender.apply(context, this._getModules(extender.deps));
		}
	}

	function getModules(namespaces) {
		var asModules = [];

		for (var i = 0; i < namespaces.length; i++) {
			asModules.push(this.as(namespaces[i]));
		}

		return asModules;
	}

})(document.querySelector('script[data-assign-js-core]').$main);