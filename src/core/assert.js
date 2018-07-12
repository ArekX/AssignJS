// @import: core/base.js
// @import: core/inspect.js

lib(['inspect', 'throwError'], function CoreAssert(inspect, throwCoreError) {

    this.assert = {
        keyNotSet: assertKeyNotSet,
        keySet: assertKeySet,
        ownKeySet: assertOwnKeySet,
        ownKeyNotSet: assertOwnKeyNotSet,
        equal: assertEquals,
        greater: assertGreater,
        less: assertLess,
        greaterOrEqual: assertGreaterOrEqual,
        lessOrEqual: assertLessOrEqual,
        notEqual: assertNotEquals,
        identical: assertIdentical,
        notIdentical: assertNotIdentical,
        isTrue: assertIsTrue,
        isFalse: assertIsFalse,
        isString: assertIsString,
        isObject: assertIsObject,
        isDefined: assertIsDefined,
        isUndefined: assertIsUndefined,
        isArray: assertIsArray,
        contains: assertContains,
        doesNotContain: assertDoesNotContains 
    };

    return;

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
        if (!inspect.isString(value)) {
            throwError(message, 'Value is not string.', data, {value: value});
        }
    }

    function assertIsObject(value, message, data) {
        if (!inspect.isObject(value)) {
            throwError(message, 'Value is not an object.', data, {value: value});
        }
    }

    function assertIsDefined(value, message, data) {
        if (!inspect.isDefined(value)) {
            throwError(message, 'Value is not defined.', data, {value: value});
        }
    }

    function assertIsUndefined(value, message, data) {
        if (inspect.isDefined(value)) {
            throwError(message, 'Value is defined.', data, {value: value});
        }
    }

    function assertIsArray(value, message, data) {
        if (!inspect.isArray(value)) {
            throwError(message, 'Value is not an array.', data, {value: value});
        }
    }

    function assertContains(value, container, message, data) {
        if (container.indexOf(value) === -1) {
            throwError(message, 'Value is not in container.', data, {value: value});
        }
    }

    function assertDoesNotContains(value, container, message, data) {
        if (container.indexOf(value) !== -1) {
            throwError(message, 'Value is in the container.', data, {value: value});
        }
    }

    function throwError(message, defaultMessage, data, defaultData) {
        throwCoreError(message || defaultMessage, data || defaultData);
    }


});