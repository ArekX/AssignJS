(function(core) {
	function Assert() {
		this._namespaceRegex = /^([a-zA-Z0-9-]+)(\.([a-zA-Z0-9-]+))+$/;
	}

	Assert.prototype.namespaceValid = assertNamespaceValid; 
	Assert.prototype.keyNotSet = assertKeyNotSet;
	Assert.prototype.keySet = assertKeySet;
	Assert.prototype.equals = assertEquals;
	Assert.prototype.notEquals = assertNotEquals;
	Assert.prototype.identical = assertIdentical;
	Assert.prototype.notIdentical = assertNotIdentical;
	Assert.prototype.isTrue = assertIsTrue;
	Assert.prototype.isFalse = assertIsFalse;

	core.assert = new Assert();
	return;

	function assertNamespaceValid(namespace, message) {
		if (namespace.match(this._namespaceRegex) === null) {
			core.throwError(message || 'Namespace is not valid.', {
				namespace: namespace
			});
		}
	}

	function assertKeyNotSet(key, object, message) {
		if (key in object) {
			core.throwError(message || 'Key is already set in object.', {
				key: key,
				object: object
			});
		}
	}

	function assertKeySet(key, object, message) {
		if (!(key in object)) {
			core.throwError(message || 'Key is not set in object.', {
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

	function assertEquals(valueA, valueB, message) {
		if (!isEqual([valueA, valueB], false)) {
			core.throwError(message || 'Values are not equal.', {values: arguments});
		}
	}

	function assertNotEquals(valueA, valueB, message) {
		if (isEqual([valueA, valueB], false)) {
			core.throwError(message || 'Values are equal.', {values: arguments});
		}
	}


	function assertIdentical(valueA, valueB, message) {
		if (!isEqual([valueA, valueB], true)) {
			core.throwError(message || 'Values are not identical.', {values: arguments});
		}
	}

	function assertNotIdentical(valueA, valueB, message) {
		if (isEqual([valueA, valueB], true)) {
			core.throwError(message || 'Values are identical.', {values: arguments});
		}
	}

	function assertIsTrue(value, message) {
		if (value !== true) {
			core.throwError(message || 'Value is not true.', {value: value});
		}
	}

	function assertIsFalse(value, message) {
		if (value !== false) {
			core.throwError(message || 'Value is not false.', {value: value});
		}
	}

})(document.querySelector('script[data-assign-js-core]').$main);