(function(core) {
	function Assert() {
		this._namespaceRegex = /^([a-zA-Z0-9-]+)(\.([a-zA-Z0-9-]+))+$/;
	}

	Assert.prototype.namespaceValid = assertNamespaceValid; 
	Assert.prototype.keyNotSet = assertKeyNotSet;
	Assert.prototype.equals = assertEquals;
	Assert.prototype.notEquals = assertNotEquals;
	Assert.prototype.identical = assertIdentical;
	Assert.prototype.notIdentical = assertNotIdentical;
	Assert.prototype.isTrue = assertIsTrue;
	Assert.prototype.isFalse = assertIsFalse;


	core.assert = new Assert();
	return;

	function assertNamespaceValid(namespace) {
		if (namespace.match(this._namespaceRegex) !== null) {
			core.throwError('Namespace is not valid.', {
				namespace: namespace
			});
		}
	}

	function assertKeyNotSet(key, object) {
		if (!(key in object)) {
			core.throwError('Key is already set in object.', {
				key: key,
				object: object
			});
		}
	}

	function isEqual(values, identical) {
		for(var i = 1; i < values.length; i++) {
			if (identical && values[i] !== values[0]) {
				return false;
			} else if (values[i] != values[0]) {
				return false;
			}
		}

		return true;
	}

	function assertEquals() {
		if (!isEqual(arguments, false)) {
			core.throwError('Values are not equal.', {values: arguments});
		}
	}

	function assertNotEquals() {
		if (isEqual(arguments, false)) {
			core.throwError('Values are equal.', {values: arguments});
		}
	}


	function assertIdentical() {
		if (!isEqual(arguments, true)) {
			core.throwError('Values are not identical.', {values: arguments});
		}
	}

	function assertNotIdentical() {
		if (isEqual(arguments, true)) {
			core.throwError('Values are identical.', {values: arguments});
		}
	}

	function assertIsTrue(value) {
		if (value !== true) {
			core.throwError('Values is not true.', {value: value});
		}
	}

	function assertIsFalse(value) {
		if (value !== false) {
			core.throwError('Values is not false.', {value: value});
		}
	}

})(document.querySelector('script[data-assign-js-core]').$main);