(function(core) {
	function Modules() {
		this._modules = {};
		this._definitions = {};
		this._runnables = {};
		this._extensions = [];
		this.initialized = false;
	}

	Modules.prototype.define = defineModule;
	Modules.prototype.extend = extendModule;
	Modules.prototype.defineRunnable = defineRunnable;
	Modules.prototype.as = asModule;
	Modules.prototype._initializeModule = initializeModule;
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
		assert.keyNotSet(namespace, this._definitions);

		if (!initializer) {
			initializer = dependencies;
		}

		initializer.deps = initializer.deps || dependencies; 
		this._definitions[namespace] = initializer;

	}

	function extendModule(namespace, extender) {
		if (!extender) {
			extender = namespace;
		}

		extender.namespace = extender.namespace || namespace;
		this._extensions.push(extender);
	}

	function defineRunnable(namespace, initializer) {
		assert.namespaceValid(namespace);
		assert.keyNotSet(namespace, this._runnables);
		this._runnables[namespace] = initializer;
	}

	function runAll() {
		this._initializeAllModules();
		this._runRunnables();
	}

	function initializeAllModules() {
		for(var namespace in this._definitions) {
			if (this._definitions.hasOwnProperty(namespace)) {
				modules.as(namespace);
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
			return modules[namespace];
		}

		return modules[namespace] = this._initializeModule(namespace);
	}

	function initializeModule(namespace) {
		var initializer = this._definitions[namespace];

		var context = {
			core: core,
			name: namespace,
			deps: initializer.deps
		};

		var asModules = [];

		for (var i = 0; i < initializer.deps.length; i++) {
			asModules.push(modules.as(initializer.deps[i]));
		}

		return initializer.apply(context, asModules);
	}

})(document.querySelector('script[data-assign-js-core]').$main);