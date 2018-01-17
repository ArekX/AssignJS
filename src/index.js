(function() {
	var moduleDefinitions = {};
	var moduleExtensions = [];
	var isInitialized = false;
	var modules = {};
	var configurators = {};
	var runnables = {};
	var namespaceRegex = /^([a-zA-Z0-9-]+)(\.([a-zA-Z0-9-]+))+$/;

	function AssignJS() {}

	AssignJS.prototype.set = setModule;
	AssignJS.prototype.remove = removeModule;
	AssignJS.prototype.extend = extendModule;
	AssignJS.prototype.as = getModule;
	AssignJS.prototype.run = runAll;
	AssignJS.prototype.registerRunnable = registerRunnable;
	AssignJS.prototype.unregisterRunnable = unregisterRunnable;
	AssignJS.prototype.configure = runConfigurator;
	AssignJS.prototype.registerConfigurator = registerConfigurator;
	AssignJS.prototype.unregisterConfigurator = unregisterConfigurator;
	AssignJS.prototype.mergeConfig = mergeConfig;
	AssignJS.prototype.throwError = throwError;
	AssignJS.prototype.isNamespaceValid = isNamespaceValid;
	AssignJS.prototype.assertValidNamespace = assertValidNamespace;

	var script = document.body.querySelector('script:last-child');
	script.setAttribute('data-assign-js', true);
	return window[script.dataset.nameAs || 'AssignJS'] = script.$main = new AssignJS();

	function setModule(moduleNamespace, dependencies, initializer) {
		assertValidNamespace(moduleNamespace);

		if (moduleNamespace in moduleDefinitions) {
			throwError("Module namespace is already defined!", {
				moduleNamespace: moduleNamespace,
				dependencies: dependencies,
				initializer: initializer
			});
		}

		moduleDefinitions[moduleNamespace] = {
			namespace: moduleNamespace,
			dependencies: dependencies,
			initializer: initializer
		};

		if (isInitialized) {
			getModule(moduleNamespace);
		}
	}

	function removeModule(moduleNamespace) {
		if (moduleNamespace in moduleDefinitions) {
			delete moduleDefinitions[moduleNamespace];
		}

		if (isInitialized) {
			delete modules[moduleNamespace];
		}
	}

	function extendModule(namespace, dependencies, initializer) {
		moduleExtensions.push({
			namespace: namespace,
			dependencies: dependencies,
			initializer: initializer
		});

		if (isInitialized) {
			processModuleExtensions();
		}
	}

	function initializeModule(context, dependencies, initializer) {
		var asModules = [];
		for (var i = 0; i < dependencies.length; i++) {
			asModules.push(getModule(dependencies[i]));
		}

		return initializer.apply(context, asModules);
	}

	function getModule(moduleNamespace) {
		if (!(moduleNamespace in moduleDefinitions)) {
			throwError("Module not defined!", {moduleNamespace: moduleNamespace});
		}

		if (modules.hasOwnProperty(moduleNamespace)) {
			return modules[moduleNamespace];
		}

		var definition = moduleDefinitions[moduleNamespace];

		var context = {
			main: script.$main,
			name: moduleNamespace,
			dependencies: definition.dependencies
		};

		return modules[moduleNamespace] = initializeModule(context, definition.dependencies, definition.initializer);
	}

	function processModuleExtensions() {
		while(moduleExtensions.length > 0) {
			var extension = moduleExtensions.pop();

			var context = {
				main: script.$main,
				module: getModule(extension.namespace),
				name: extension.namespace,
				dependencies: extension.dependencies
			};

			initializeModule(context, extension.dependencies, extension.initializer);
		}
	}

	function throwError(message, data) {
		var object = {message: message};
		data = data || {};

		for(var item in data) {
			if (!data.hasOwnProperty(item)) {
				continue;
			}

			object[item] = data[item];
		}

		object.toString = function() {
			return message;
		};

		throw object;
	}

	function assertValidNamespace(namespace) {
		if (!isNamespaceValid(namespace)) {
			throwError("Namespace is not valid!", {namespace: namespace});
		}
	}


	function isNamespaceValid(namespace) {
		return namespace.match(namespaceRegex) !== null;
	}

	function registerRunnable(runnableName, dependencies, runCallback) {
		assertValidNamespace(runnableName);

		if (runnableName in runnables) {
			throwError("Runnable is already defined!", {runnableName: runnableName});
		}

		runnables[runnableName] = {dependencies: dependencies, callback: runCallback};
	}

	function runAll() {
		for(var moduleNamespace in moduleDefinitions) {
			if (moduleDefinitions.hasOwnProperty(moduleNamespace)) {
				getModule(moduleNamespace);
			}
		}

		processModuleExtensions();
		runAllRunnables();
	}

	function runAllRunnables() {
		for (var runnableName in runnables) {
			if (!runnables.hasOwnProperty(runnableName)) {
				continue;
			}

			var runnable = runnables[runnableName];
			var modules = [];
			for (var i = 0; i < runnable.dependencies.length; i++) {
				modules.push(getModule(runnable.dependencies[i]));
			}

			runnable.callback.apply(this, modules);
		}
	}

	function unregisterRunnable(runnableName) {
		if (!(runnableName in runnables)) {
			throwError("Runnable is not defined!", {runnableName: runnableName});
		}

		delete runnables[runnableName];
	}

	function runConfigurator(configureNamespace, config) {
		if (!(configureNamespace in configurators)) {
			throwError("Configurator is not defined!", {configureNamespace: configureNamespace});
		}

		configurators[configureNamespace](config);
	}

	function registerConfigurator(configureNamespace, handler) {
		assertValidNamespace(configureNamespace);

		if (configureNamespace in configurators) {
			throwError("Configurator is already defined!", {configurator: configureNamespace, handler: handler});
		}

		configurators[configureNamespace] = handler;
	}

	function unregisterConfigurator(configureNamespace, handler) {
		if (!(configureNamespace in configurators)) {
			throwError("Configurator is not defined!", {configureNamespace: configureNamespace});
		}

		delete configurators[configureNamespace];
	}

	function mergeConfig() {
		var mergedConfig = {};
		var args = arguments;

		if (args.length === 1) {
			return args[0];
		}

		var useRecursiveMerge = true;

		if (typeof args[0] === "boolean") {
			useRecursiveMerge = args[0];
			args = [];
			for (var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
		}

		if (args.length === 0) {
			return {};
		}

		for (var i = 0; i < args.length; i++) {
			mergedConfig = recursiveMerge(mergedConfig, args[i]);
		}

		return mergedConfig;

		function recursiveMerge(configA, configB) {
			var merged = configA;

			for(var configName in configB) {
				if (!configB.hasOwnProperty(configName)) {
					continue;
				}

				var itemB = configB[configName];
				var itemA = configA[configName];

				if (
					(typeof itemB === "object" && itemB !== null && itemB.constructor === mergedConfig.constructor) &&
					(typeof itemA === "object" && itemA !== null && itemA.constructor === mergedConfig.constructor) &&
					useRecursiveMerge
					) {
					itemA = recursiveMerge(itemA, itemB);
				} else {
					itemA = itemB;
				}

				merged[configName] = itemA;
			}

			return merged;
		}
	}
})();