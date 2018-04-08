// @import: core
// @import: compiler
// @import: container
// @import: handlers/base.js

"use strict";

lib(['compiler', 'container', 'handlers', 'assert', 'config', 'parser'], 
    function(compiler, containerManager, handlers, assert, configManager, parser) {
    var regex = null;

    parser.events.on('beforeBootstrap', function() {
        compiler.addHandler("core.trackElement", getMatchRegex(), trackElement);
    });

    var config = configManager.handlers.trackElement = {
        containerType: 'base'
    };

    handlers.trackElement = {
        config: config,
        parseString: parseStringDef,
        trackElement: trackElement
    };

    function getMatchRegex() {
        if (regex === null) {
            regex = new RegExp('^\s*:(' + configManager.base.nameRegex.source + ')\s*$');
        }

        return regex;
    }

    function parseStringDef(line) {
        var parts = line.split(getMatchRegex());

        assert.identical(parts.length, 3, "Cannot parse tracked property. Invalid syntax.", {
            line: line,
            parts: parts
        });

        return {
            scopeName: parts[1]
        };
    }

    function trackElement(line, element) {
        var def = parseStringDef(line);
        var result = containerManager.wrap(element, config.containerType);
        console.log(result);
    }
});