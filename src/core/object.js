lib(['inspect'], function CoreObject(inspect) {

    this.object = {
        create: createObject,
        extend: extendObject,
        merge: merge,
        clone: clone,
        parseJson: parseJson,
        getValue: getValue
    };

    return;

    function createObject(ob, params) {
        var obItem = Object.create(ob);
        obItem.init && obItem.init.apply(obItem, params);
        return obItem;
    }

    function extendObject(ob, parentObject) {
        return merge(true, Object.create(parentObject), ob);
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
});