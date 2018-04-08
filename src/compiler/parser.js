// @import: core
// @import: compiler/compiler.js

"use strict";

lib(['vars', 'html', 'compiler', 'events', 'throwError', 'addRunner', 'config'], 
    function(vars, html, compiler, events, throwError, addRunner, configManager) {

    var config = {
        checkAttributes: ['[assign]', '[as]', 'data-assign'],
        selector: '[data-assign], [\\[assign\\]], [\\[as\\]]',
    };

    configManager.parser = config;

    this.parser = {
        getActiveElements: getActiveElements,
        getParseLines: getParseLines,
        parseText: parseText,
        parse: parse
    };

    var eventList = this.parser.events = events.createGroup([
        'beforeBootstrap',
        'afterBootstrap'
    ], this.parser)

    addRunner(function() {
        if (!eventList.trigger('beforeBootstrap')) {
            return;
        }

        parse(getActiveElements(document));

        eventList.trigger('afterBootstrap');
    });

    return;

    function getActiveElements(element) {
        return element.querySelectorAll(config.selector);
    }

    function getParseLines(element) {
        var lines = [];

        for(var i = 0; i < config.checkAttributes.length; i++) {
            var check = config.checkAttributes[i];
            var result = element.getAttribute(check);
            if (result) {
                lines.push(result);
                var counter = 1;

                while((result = element.getAttribute(check + '-' + counter++)) !== null) {
                    lines.push(result);
                }
                break;
            }
        }

        return lines;
    }

    function parse(node) {
        if (vars.isIterable(node)) {
            for(var i = 0; i < node.length; i++) {
                processNode(node[i]);
            }   
            return;      
        }
   
        processNode(node);

        function processNode(node) {
            if (!node.$parsed) {
                compiler.compileElement(node, getParseLines(node));
                node.$parsed = true;
            }
        }
    }

    function parseText(text, ownerTag) {
        var wrapTag = ownerTag || html.create('compiled');
        var element = html.parse(wrapTag, text);

        if (!ownerTag && element.children.length > 1) {
            throwError("Compile text must have at least one root element if owner tag is not specified.", {
                text: text,
                ownerTag: ownerTag
            });
        }

        return ownerTag ? ownerTag : element.children[0];
    }
});