(function(core) {
    "use strict";

    function Maker() {}

    Maker.prototype.mix = mixPrototype;
    Maker.prototype.extend = extendPrototype;
    Maker.prototype.create = createObject;
    Maker.prototype.configure = configure;

    core.maker = new Maker();
    return;

    function configure(object, setData) {
        for (var name in setData) {
            if (setData.hasOwnProperty(name)) {
                object[name] = setData[name];
            }
        }

        return object;
    }

    function createObject(func, props, args) {
        if (args) {
            func = func.bind.apply(func, [null].concat(args));
        }
        return Object.create(new func(), props || undefined);
    }
    
    function mixPrototype(func, mixWith) {
        var funcName = func.name;
        var superObject = {};
        var proto = func.prototype;
        proto.super = superObject;

        if (Array.isArray(mixWith)) {
            for(var i = 0; i < mixWith.length; i++) {
                var mix = mixWith[i].prototype;
                var mixName = mixWith[i].name;

                for(var propName in mix) {
                    if (!mix.hasOwnProperty(propName)) {
                        continue;
                    }

                    if (propName in proto) {
                        if (!superObject[mixName]) {
                            superObject[mixName] = {};
                        }

                        if (!superObject[funcName]) {
                            superObject[funcName] = {};
                        }

                        superObject[funcName][propName] = proto[propName];
                        superObject[mixName][propName] = mix[propName];
                    }

                    proto[propName] = mix[propName];
                }
            }

            proto.constructor = func;

            return func;
        }

        var mixProto = mixWith.prototype;
        for(var extension in mixProto) {
            if (mixProto.hasOwnProperty(extension)) {
                if (extension in proto) {
                    superObject[extension] = proto[extension];
                }

                proto[extension] = mixProto[extension];
            }
        }

        proto.constructor = func;

        return func;
    }

    function extendPrototype(func, extendWith, leftSide) {
        var proto = func;
        var protoWalker = proto;

        if (Array.isArray(extendWith)) {
            for(var i = 0; i < extendWith.length; i++) {
                extendProtoWalker(extendWith[leftSide ? i : extendWith.length - 1 - i]);
            }

            return func;
        }

        extendProtoWalker(extendWith);

        return func;

        function extendProtoWalker(with) {
            protoWalker.prototype = Object.create(with.prototype);
            protoWalker.prototype.constructor = protoWalker;
            protoWalker = protoWalker.prototype;
        }
    }



})(document.querySelector('script[data-assign-js-core]').$main);