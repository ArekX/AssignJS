(function(core) {
    "use strict";
    function Assert() {
        this._namespaceRegex = /^([a-zA-Z0-9-]+)(\.([a-zA-Z0-9-]+))+$/;
    }

    Assert.prototype.namespaceValid = assertNamespaceValid; 
    Assert.prototype.keyNotSet = assertKeyNotSet;
    Assert.prototype.keySet = assertKeySet;
    Assert.prototype.ownKeySet = assertOwnKeySet;
    Assert.prototype.ownKeyNotSet = assertOwnKeyNotSet;
    Assert.prototype.equals = assertEquals;
    Assert.prototype.greater = assertGreater;
    Assert.prototype.less = assertLess;
    Assert.prototype.greaterOrEqual = assertGreaterOrEqual;
    Assert.prototype.lessOrEqual = assertLessOrEqual;
    Assert.prototype.notEquals = assertNotEquals;
    Assert.prototype.identical = assertIdentical;
    Assert.prototype.notIdentical = assertNotIdentical;
    Assert.prototype.isTrue = assertIsTrue;
    Assert.prototype.isFalse = assertIsFalse;
    Assert.prototype.isString = assertIsString;
    Assert.prototype.isObject = assertIsObject;
    Assert.prototype.isDefined = assertIsDefined;
    Assert.prototype.isUndefined = assertIsUndefined;
    Assert.prototype.isArray = assertIsArray;

    var vars = core.vars;
    core.assert = new Assert();
    return;

    function assertNamespaceValid(namespace, message, data) {
        if (namespace.match(this._namespaceRegex) === null) {
            throwError(message, 'Namespace is not valid.', data, {namespace: namespace });
        }
    }

    function assertKeyNotSet(key, object, message, data) {
        if (key in object) {
            throwError(message, 'Key is already set in object.', data, {
                key: key,
                object: object
            });
        }
    }

    function assertKeySet(key, object, message, data) {
        if (!(key in object)) {
            throwError(message, 'Key is not set in object.', data, {
                key: key,
                object: object
            });
        }
    }

    function assertOwnKeyNotSet(key, object, message, data) {
        if (object.hasOwnProperty(key)) {
            throwError(message, 'Key is already set in object.', data, {
                key: key,
                object: object
            });
        }
    }

    function assertOwnKeySet(key, object, message, data) {
        if (!object.hasOwnProperty(key)) {
            throwError(message, 'Key is not set in object.', data, {
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

    function assertGreater(valueA, valueB, message, data) {
        if (valueA <= valueB) {
            throwError(message, 'Second value is greater than first.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertLess(valueA, valueB, message, data) {
        if (valueA >= valueB) {
            throwError(message, 'Second value is less than first.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertGreaterOrEqual(valueA, valueB, message, data) {
        if (valueA < valueB) {
            throwError(message, 'Second value is greater than first.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertLessOrEqual(valueA, valueB, message, data) {
        if (valueA > valueB) {
            throwError(message, 'Second value is less than first.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertEquals(valueA, valueB, message, data) {
        if (!isEqual([valueA, valueB], false)) {
            throwError(message, 'Values are not equal.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertNotEquals(valueA, valueB, message, data) {
        if (isEqual([valueA, valueB], false)) {
            throwError(message, 'Values are equal.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertIdentical(valueA, valueB, message, data) {
        if (!isEqual([valueA, valueB], true)) {
            throwError(message, 'Values are not identical.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertNotIdentical(valueA, valueB, message, data) {
        if (isEqual([valueA, valueB], true)) {
            throwError(message, 'Values are identical.', data, {checkA: valueA, checkB: valueB});
        }
    }

    function assertIsTrue(value, message, data) {
        if (value !== true) {
            throwError(message, 'Value is not true.', data, {value: value});
        }
    }

    function assertIsFalse(value, message, data) {
        if (value !== false) {
            throwError(message, 'Value is not false.', data, {value: value});
        }
    }

    function assertIsString(value, message, data) {
        if (!vars.isString(value)) {
            throwError(message, 'Value is not string.', data, {value: value});
        }
    }

    function assertIsObject(value, message, data) {
        if (!vars.isObject(value)) {
            throwError(message, 'Value is not an object.', data, {value: value});
        }
    }

    function assertIsDefined(value, message, data) {
        if (!vars.isDefined(value)) {
            throwError(message, 'Value is not defined.', data, {value: value});
        }
    }

    function assertIsUndefined(value, message, data) {
        if (vars.isDefined(value)) {
            throwError(message, 'Value is defined.', data, {value: value});
        }
    }

    function assertIsArray(value, message, data) {
        if (!vars.isArray(value)) {
            throwError(message, 'Value is not an array.', data, {value: value});
        }
    }

    function throwError(message, defaultMessage, data, defaultData) {
        core.throwError(message || defaultMessage, data || defaultData);
    }


})(document.querySelector('script[data-assign-js-core]').$main);