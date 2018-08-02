lib(['inspect', 'compiler', 'config', 'addRunner', 'events'],
function CompilerParser(inspect, compiler, configManager, addRunner, events) {

    var config = configManager.parser = {
        startContainer: document,
        checkAttributes: ['[assign]', '[as]', 'data-assign'],
        selector: '[data-assign]:not([data-assignjs-parsed]), [\\[assign\\]]:not([data-assignjs-parsed]), [\\[as\\]]:not([data-assignjs-parsed])',
        initializedAttribute: 'data-assignjs-parsed'
    };

    var eventList = events.createGroup([
        'beforeRun',
        'afterRun'
    ], this);

    compiler.parser = {
        findActiveElements: findActiveElements,
        getParseLines: getParseLines,
        parse: parse,
        parseAll: parseAll,
        events: eventList
    };

    addRunner(function () {
        if (!eventList.trigger('beforeRun')) {
            return;
        }

        parseAll();
        eventList.trigger('afterRun');
    });

    function parseAll(startContainer) {
        var activeElements = findActiveElements(startContainer || config.startContainer);
        for (var i = 0; i < activeElements.length; i++) {
            parse(activeElements[i]);
        }
    }

    function findActiveElements(element) {
        return element.querySelectorAll(config.selector);
    }

    function parse(node) {
        // FIXME: Well damn... we need to do this in stages.
        // Stage 1: Parse all and create objects
        // Stage 2: Initialize all pending objects.
        // Stage 3: Repeat while there are elements to parse.

        if (inspect.isCompiledElement(node)) {
            return;
        }

        compiler.compileElement(node, getParseLines(node));
        node.setAttribute(config.initializedAttribute, true);
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
