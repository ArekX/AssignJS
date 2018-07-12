// @import: compiler/base.js

lib(['inspect', 'compiler', 'config', 'addRunner', 'events'], 
function CompilerParser(inspect, compiler, configManager, addRunner, events) {

    var config = configManager.parser = {
        startContainer: document,
        checkAttributes: ['[assign]', '[as]', 'data-assign'],
        selector: '[data-assign], [\\[assign\\]], [\\[as\\]]',
    };

    var eventList = events.createGroup([
        'beforeRun',
        'afterRun'
    ], this);

    compiler.parser = {
        findActiveElements: findActiveElements,
        getParseLines: getParseLines,
        parse: parse,
        events: eventList
    };

    addRunner(function () {
        if (!eventList.trigger('beforeRun')) {
            return;
        }

        parse(findActiveElements(config.startContainer));

        eventList.trigger('afterRun');
    });

    function findActiveElements(element) {
        return element.querySelectorAll(config.selector);
    }

    function parse(node) {
        if (inspect.isIterable(node)) {
            for (var i = 0; i < node.length; i++) {
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

    function getParseLines(element) {
        var lines = [];

        for (var i = 0; i < config.checkAttributes.length; i++) {
            var check = config.checkAttributes[i];
            var result = element.getAttribute(check);
            if (result) {
                lines.push(result);
                var counter = 1;

                while ((result = element.getAttribute(check + '-' + counter++)) !== null) {
                    lines.push(result);
                }
                break;
            }
        }

        return lines;
    }
});