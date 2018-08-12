lib(['inspect'], function(inspect) {

    this.object = {
        create: createObject,
        merge: merge,
        clone: clone,
        parseJson: parseJson,
        resolveValue: resolveValue
    };

    return;

    function createObject(ob, params) {
        var obItem = Object.create(ob);
        obItem.init && obItem.init.apply(obItem, params);
        return obItem;
    }
    
    function merge() {
        var mergedConfig = {};
        var args = arguments;

        if (args.length === 1) {
            return args[0];
        }

        var useRecursiveMerge = false;

        if (inspect.isBoolean(args[0])) {
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

        function recursiveMerge(objectA, objectB) {
            var merged = objectA;

            for(var configName in objectB) {
                if (!objectB.hasOwnProperty(configName)) {
                    continue;
                }

                var itemB = objectB[configName];
                var itemA = objectA[configName];

                if (
                    useRecursiveMerge &&
                    (typeof itemB === "object" && itemB !== null && itemB.constructor === mergedConfig.constructor) &&
                    (typeof itemA === "object" && itemA !== null && itemA.constructor === mergedConfig.constructor)
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


    function resolveValue(object, propName, defaultValue) {
        if (propName in object) {
            return object[propName];
        }

        var walker = object;

        varparts = propName.split('.');

        for(var i = 0; i < varparts.length - 1; i++) {
            if (!(varparts[i] in walker)) {
                return defaultValue;
            }

            walker = walker[varparts[i]];
        }

        var lastName = varparts[varparts.length - 1];

        if (!(lastName in walker)) {
            return defaultValue;
        }

        return walker[lastName];
    }
});
