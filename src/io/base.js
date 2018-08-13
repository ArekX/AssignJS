// @import: core

lib(['assert', 'inspect', 'object'], function(assert, inspect, object) {

    var handlerList = {};

    this.io = {
        resolve: resolve,
        addHandler: addHandler
    };

    function resolve(element, ioString) {
        var ioParts = ioString.split(':');

        assert.lessOrEqual(ioParts.length, 2, "IO string must have only one ':' character.");

        var results = {};

        for(var i = 0; i < ioParts.length; i++) {
            var part = ioParts[i];
            var type = i === 0 ? 'input' : 'output';
            var resolver = i == 0 ? getInputResolver : getOutputResolver;
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

                partHandler = resolver(runHandler.handler, element, part);
                break;
            }

            assert.isTrue(partHandler !== null, 'No matching handler found for this IO.', {
                io: part,
                type: type
            });

            results[type] = partHandler;
        }

        return results;
    }

    function getInputResolver(ioHandler, element, ioPart) {
        var config = ioHandler.init ? ioHandler.init(element, ioPart) : {};

        config.element = element;

        return config.handler = {
            read: ioHandler.read.bind(config),
            canRead: ioHandler.canRead
        };
    }

    function getOutputResolver(ioHandler, element, ioPart) {
        var config = ioHandler.init ? ioHandler.init(element, ioPart) : {};

        config.element = element;

        return config.handler = {
          write: ioHandler.write.bind(config),
          shouldWrite: ioHandler.shouldWrite.bind(config),
          canWrite: ioHandler.canWrite
        };
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
