// @import: core

lib(['inspect', 'throwError', 'assert', 'config', 'task'],
    function CompilerBase(inspect, throwError, assert, configManager, task) {

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

        function compileElement(element, lines, afterCompile) {
            if (inspect.isCompiledElement(element)) {
                afterCompile && afterCompile();
                return;
            }

            var elementObject = inspect.getElementObject(element) || {};
            var counter = 0;

            if (lines.length === 0) {
              afterCompile && afterCompile();
            }

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                var compiled = false;

                for (var handlerName in handlerList) {
                    if (!handlerList.hasOwnProperty(handlerName)) {
                        continue;
                    }

                    var runHandler = handlerList[handlerName];
                    var isMatch = inspect.isFunction(runHandler.checker) ?
                        runHandler.checker(line, element) : line.match(runHandler.checker);

                    if (!isMatch) {
                        continue;
                    }

                    compiled = elementObject.compiled = true;
                    element[configManager.assignParam] = elementObject;

                    runHandler(line, element);
                    break;
                }

                if (compiled || !config.strict) {
                    continue;
                }

                throwError("Cannot parse assigment!", {
                    line: line,
                    element: element
                });
            }
        }
    });
