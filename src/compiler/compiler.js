// @import: core

"use strict";

lib(['vars', 'throwError', 'assert', 'config'], function(vars, throwError, assert, configManager) {

    var handlerList = {};

    var config = {
        strict: true,
        resolveConflictHandler: null
    };

    configManager.compiler = config;
    this.compiler = {
        addHandler: addHandler,
        compileElement: compileElement
    };

    return;

    function addHandler(namespace, checker, handler) {

        if (namespace in handlerList) {
            namespace = config.resolveConflictHandler ? config.resolveConflictHandler(namespace, handlerList) : namespace;
        }

        assert.keyNotSet(namespace, handlerList, 'This handler is already defined.');

        if (!handler) {
            handler = checker;
        }

        handler.checker = handler.checker || checker;
        handlerList[namespace] = handler;
    }

    function compileElement(element, lines) {
        if (element.$compiled) {
            return;
        }

        for(var i = 0; i < lines.length; i++) {        
            var line = lines[i].trim();
            var compiled = false;

            for(var handlerName in handlerList) {
                if (!handlerList.hasOwnProperty(handlerName)) {
                    return;
                }

                var runHandler = handlerList[handlerName];
                var isMatch = vars.isFunction(runHandler.checker) ? runHandler.checker(line, element) : line.match(runHandler.checker);

                if (isMatch) {
                    compiled = true;
                    element.$compiled = true;
                    runHandler(line, element);
                    break;
                }
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