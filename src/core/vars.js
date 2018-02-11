(function(core) {
    "use strict";

    var plainObjectConstructor = ({}).constructor;

    function Vars() {}

    Vars.prototype.merge = merge;
    Vars.prototype.clone = clone;
    Vars.prototype.parseJson = parseJson;
    Vars.prototype.defaultValue = defaultValue;
    Vars.prototype.getValue = getValue;
    Vars.prototype.isEmpty = isEmpty;
    Vars.prototype.isObject = isObject;
    Vars.prototype.isPlainObject = isPlainObject;
    Vars.prototype.isNumber = isNumber;
    Vars.prototype.isString = isString;
    Vars.prototype.isDefined = isDefined;
    Vars.prototype.isBoolean = isBoolean;
    Vars.prototype.isFunction = isFunction;
    Vars.prototype.isArray = isArray;
    Vars.prototype.forceInt = forceInt;
    Vars.prototype.forceFloat = forceFloat;
    Vars.prototype.extendPrototype = extendPrototype;

    core.vars = new Vars();
    return;

    function getValue(object, varname, defaultValue) {
        if (varname in object) {
            return object[varname];
        }

        var walker = object;

        varparts = varname.split('.');

        for(var i = 0; i < varparts.length; i++) {
            if (!(varparts[i] in walker)) {
                return defaultValue;
            }

            walker = walker[varparts[i]];
        }

        if (!this.isDefined(walker)) {
            return defaultValue;
        }

        return walker;
    }

    function isEmpty(value) {
        return !this.isFunction(value)
               value === "" ||
               value === "0" ||
               value === 0 ||
               value === undefined ||
               (this.isObject(value) && Object.keys(value).length == 0);
    }

    function isFunction(value) {
        return typeof value === "function";
    }

    function isArray(value) {
        return this.isObject(value) && value.constructor === Array;
    }

    function isPlainObject(value) {
        return this.isObject(value) && plainObjectConstructor === value.constructor;
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

    function merge() {
        var mergedConfig = {};
        var args = arguments;

        if (args.length === 1) {
            return args[0];
        }

        var useRecursiveMerge = true;

        if (this.isBoolean(args[0])) {
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

    function defaultValue(value, defaultValue) {
        return !this.isDefined(value) ? defaultValue : value;
    }

    function parseJson(jsonString, failValue) {
        failValue = this.defaultValue(failValue, null);

        try {
            return $.parseJSON(jsonString);
        } catch (e) {
            return failValue;
        }
    }

    function clone(jsonObject) {
        var addedObjects = [];

        var clonedObject = process(jsonObject);

        return clonedObject == false ? {} : clonedObject;

        function process(object) {
            var newObject = {};

            if (addedObjects.indexOf(object) !== -1) {
                return false;
            }

            addedObjects.push(object);

            for (var key in object) {
                if (!object.hasOwnProperty(key)) {
                    continue;
                }

                if (isObject(object[key])) {
                    var result = process(object[key]);

                    if (result === false) {
                        continue;
                    }

                    newObject[key] = result;
                    continue;
                }

                newObject[key] = object[key];
            }

            return newObject;
        }
    }


    function forceInt(value, failValue, radix) {
        radix = this.defaultValue(radix, 10);
        var value = parseInt(value, radix);
        return !isNaN(value) ? value : failValue;
    }

    function forceFloat(value, failValue) {
        var value = parseFloat(value);
        return !isNaN(value) ? value : failValue;
    }

    function extendPrototype(prototype, extensions, properties) {
        var result = Object.create(prototype, properties);
        result.super = {};

        for(var extension in extensions) {
            if (extensions.hasOwnProperty(extension)) {
                if (extension in result) {
                    result.super[extension] = result[extension];
                }

                result[extension] = extensions[extension];
            }
        }

        return result;
    }

})(document.querySelector('script[data-assign-js-core]').$main);