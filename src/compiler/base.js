// @import: core

lib(['inspect', 'throwError', 'assert', 'config'],
    function CompilerBase(inspect, throwError, assert, configManager) {

        var handlerList = {};

        var config = {
            strict: false
        };

        configManager.compiler = config;

        this.compiler = {
            addHandler: addHandler,
            compileElement: compileElement
        };

        return;

        function addHandler(namespace, checker, handler) {
            assert.keyNotSet(namespace, handlerList, 'This handler is already defined.');

            if (!handler) {
                handler = checker;
            }

            handler.checker = handler.checker || checker;
            handlerList[namespace] = handler;
        }

        function compileElement(element, lines) {
            if (inspect.isCompiledElement(element)) {
                return;
            }

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                var compiled = false;

                for (var handlerName in handlerList) {
                    if (!handlerList.hasOwnProperty(handlerName)) {
                        return;
                    }

                    var runHandler = handlerList[handlerName];
                    var isMatch = inspect.isFunction(runHandler.checker) ?
                        runHandler.checker(line, element) : line.match(runHandler.checker);

                    if (!isMatch) {
                        continue;
                    }
                    
                    compiled = true;
                    element[configManager.assignParam] = {
                        compiled: true
                    };

                    runHandler(line, element);
                    break;
                }

                if (compiled || !config.strict) {
                    return;
                }

                throwError("Cannot parse assigment!", {
                    line: line,
                    element: element
                });
            }
        }
    });