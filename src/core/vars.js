// @import: core/base.js

"use strict";

lib(function() {
    
    var plainObjectConstructor = ({}).constructor;

    this.vars = {
        merge: merge,
        clone: clone,
        parseJson: parseJson,
        getValue: getValue,
        isEmpty: isEmpty,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isNumber: isNumber,
        isString: isString,
        isDefined: isDefined,
        isBoolean: isBoolean,
        isFunction: isFunction,
        isElement: isElement,
        isInputElement: isInputElement,
        isIterable: isIterable,
        isArray: isArray,
        forceInt: forceInt,
        forceFloat: forceFloat
    };

    return;

    function getValue(object, propName, defaultValue) {
        if (propName in object) {
            return object[propName];
        }

        var walker = object;

        varparts = propName.split('.');

        for(var i = 0; i < varparts.length; i++) {
            if (!(varparts[i] in walker)) {
                return defaultValue;
            }

            walker = walker[varparts[i]];
        }

        if (!isDefined(walker)) {
            return defaultValue;
        }

        return walker;
    }

    function isEmpty(value) {
        return !isFunction(value) && (
                   value === "" ||
                   value === "0" ||
                   value === 0 ||
                   value === null ||
                   value === undefined ||
                   (isObject(value) && Object.keys(value).length == 0)
               );
    }

    function isFunction(value) {
        return typeof value === "function";
    }

    function isArray(value) {
        return isObject(value) && value.constructor === Array;
    }

    function isPlainObject(value) {
        return isObject(value) && plainObjectConstructor === value.constructor;
    }

    function isObject(value) {
        return typeof value === "object";
    }

    function isNumber(value) {
        return typeof value === "number";
    }

    function isDefined(value) {
        return typeof value !== "undefined";
    }

    function isString(value) {
        return typeof value === "string";
    }

    function isBoolean(value) {
        return typeof value === "boolean";  
    }

    function isElement(value) {
        return value instanceof HTMLElement;
    }

    function isInputElement(value) {
        return (element instanceof HTMLInputElement) || 
               (element instanceof HTMLSelectElement) ||
               (element instanceof HTMLTextAreaElement);
    }

    function merge() {
        var mergedConfig = {};
        var args = arguments;

        if (args.length === 1) {
            return args[0];
        }

        var useRecursiveMerge = false;

        if (isBoolean(args[0])) {
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

    function parseJson(jsonString, failValue) {
        failValue = failValue || null;

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return failValue;
        }
    }

    function clone(jsonObject) {
        var oldObjects = [];
        var clonedObjects = [];

        return process(jsonObject);

        function process(object) {
            var cloned = isArray(object) ? [] : {};

            var existingIndex = oldObjects.indexOf(object);

            if (existingIndex !== -1) {
                return clonedObjects[existingIndex];
            }

            oldObjects.push(object);
            clonedObjects.push(cloned);

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var value = object[key];
                    cloned[key] = isObject(value) ? process(value) : value; 
                }
            }

            return cloned;
        }
    }


    function forceInt(value, failValue, radix) {
        radix = radix || 10;
        var value = parseInt(value, radix);
        return !isNaN(value) ? value : failValue;
    }

    function forceFloat(value, failValue) {
        var value = parseFloat(value);
        return !isNaN(value) ? value : failValue;
    }

    function isIterable(value) {
        return Array.isArray(value) ||
            value instanceof NodeList ||
            value instanceof HTMLCollection ||
            (value.hasOwnProperty(0) && value.hasOwnProperty('length') && value.hasOwnProperty(value.length - 1));
    }

});