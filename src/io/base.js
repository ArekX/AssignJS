// @import: core

lib(['assert', 'inspect', 'object'], function IoBase(assert, inspect, object) {

    var handlerList = {};

    this.io = {
        resolve: resolve,
        addHandler: addHandler
    };

    function resolve(ioString, context) {
        var ioParts = ioString.split(':');

        assert.lessOrEqual(ioParts.length, 2, "IO string must have only one ':' character.");

        var results = {};
        
        for(var i = 0; i < ioParts.length; i++) {
            var part = ioParts[i];
            var type = i === 0 ? 'input' : 'output';
            var partHandler = null;

            for (var handlerName in handlerList) {

                if (!handlerList.hasOwnProperty(handlerName)) {
                    continue;
                }
    
                var runHandler = handlerList[handlerName];
    
                var isMatch = inspect.isFunction(runHandler.checker) ?
                    runHandler.checker(part, element) : part.match(runHandler.checker);
    
                if (isMatch === null) {
                    continue;
                }

                if (runHandler.isSingleton) {
                    partHandler = runHandler.init(part, context);
                } else {
                    partHandler = object.create(runHandler.handler, [part, context]);
                }
            }

            assert.isTrue(partHandler !== null, 'No matching handler found for this IO.', {
                io: part,
                type: type
            })

            results[type] = partHandler; 
        }

        return results;
    }

    function addHandler(namespace, checker, ioHandler, isStatic) {
        assert.keyNotSet(namespace, handlerList, 'This handler is already defined.');

        handlerList[namespace] = {
            checker: checker,
            handler: ioHandler,
            isStatic: isStatic
        };
    }
});