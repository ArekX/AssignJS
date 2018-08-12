// @import: core

lib(['inspect', 'throwError', 'assert', 'config', 'task'],
    function(inspect, throwError, assert, configManager, task) {

        var handlerList = {};

        var config = {
            strict: false
        };

        configManager.compiler = config;

        this.compiler = {
            addHandler: addHandler,
            compileTemplate: compileTemplate,
            compileElement: compileElement,
            writeElementObject: writeElementObject
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

        function compileTemplate(element) {
            var elementObject = inspect.getElementObject(element) || {};

            elementObject.template = element.innerHTML;
            element.innerHTML = '';

            writeElementObject(element, elementObject);
        }

        function compileElement(element, lines, afterCompile) {
            if (inspect.isCompiledElement(element)) {
                afterCompile && afterCompile();
                return;
            }

            var elementObject = inspect.getElementObject(element) || {};
            writeElementObject(element, elementObject);

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

        function writeElementObject(element, object) {
            element[configManager.assignParam] = object;
        }
    });
