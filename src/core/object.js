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

    function createObject(func, props, initSet) {
        function ClosureObject() {
            func.call(this);
        }

        ClosureObject.prototype = Object.create(func.prototype, props || undefined);
        var ob = new ClosureObject();
        
        initSet && this.configure(ob, initSet);
        
        return ob;
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

    function extendPrototype(func, extendWith) {
        var proto = func;
        var protoWalker = proto;

        if (Array.isArray(extendWith)) {
            for(var i = extendWith.length - 1; i > -1; i--) {
                protoWalker.prototype = Object.create(extendWith[i].prototype);
                protoWalker.prototype.constructor = protoWalker;
                protoWalker = protoWalker.prototype;
            }

            return func;
        }
 
        proto.prototype = Object.create(extendWith.prototype);
        proto.prototype.constructor = proto;

        return func;
    }



})(document.querySelector('script[data-assign-js-core]').$main);