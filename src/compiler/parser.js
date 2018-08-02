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

    var instanceConfig = this.instanceConfig;

    addRunner(function (config) {
        if (!eventList.trigger('beforeRun')) {
            return;
        }

        var container = instanceConfig.container ?
            document.querySelector(instanceConfig.container) : null;

        parseAll(container);

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
