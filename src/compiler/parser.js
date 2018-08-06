lib(['inspect', 'compiler', 'config', 'addRunner', 'events'],
function CompilerParser(inspect, compiler, configManager, addRunner, events) {

    var config = configManager.parser = {
        startContainer: document,
        parseLineRegex: /(\[assign(-[^\]]+)?\]|\[as(-[^\]]+)?\]|data-assign(-[^\=]+)?)/,
        selector: '[data-assign]:not([data-assignjs-parsed]), [\\[assign\\]]:not([data-assignjs-parsed]), [\\[as\\]]:not([data-assignjs-parsed])',
        templateSelector: '[data-template]:not([data-template-parsed]), [\\[template\\]]:not([data-template-parsed])',
        initializedAttribute: 'data-assignjs-parsed',
        initializedTemplateAttribute: 'data-template-parsed',
    };


    compiler.parser = {
        findActiveElements: findActiveElements,
        getParseLines: getParseLines,
        parse: parseAll
    };

    var eventList = compiler.parser.events = events.createGroup([
        'beforeFirstRun',
        'afterFirstRun'
    ], compiler.parser);

    var instanceConfig = this.instanceConfig;

    addRunner(function (config) {
        if (!eventList.beforeFirstRun.trigger()) {
           return;
        }

        var container = instanceConfig.container ?
            document.querySelector(instanceConfig.container) : null;

        parseAll(container);

        eventList.afterFirstRun.trigger();
    });

    function parseAll(startContainer) {
        var container = startContainer || config.startContainer;
        parseTemplates(container);
        parseElements(container);
    }

    function parseTemplates(container) {
        var templates = findActiveTemplates(container);
        for (var i = 0; i < templates.length; i++) {
            parseTemplate(templates[i]);
        }
    }

    function parseElements(container) {
        var elements = findActiveElements(container);
        for (var i = 0; i < elements.length; i++) {
            parseElement(elements[i]);
        }
    }

    function findActiveElements(element) {
        return element.querySelectorAll(config.selector);
    }

    function findActiveTemplates(element) {
        return element.querySelectorAll(config.templateSelector);
    }

    function parseTemplate(node) {
        if (inspect.isCompiledTemplate(node)) {
            return;
        }

        if (node.parentElement === null) {
            return;
        }

        compiler.compileTemplate(node);
        node.setAttribute(config.initializedTemplateAttribute, true);
    }

    function parseElement(node) {
        if (inspect.isCompiledElement(node)) {
            return;
        }

        compiler.compileElement(node, getParseLines(node));
        node.setAttribute(config.initializedAttribute, true);
    }

    function getParseLines(element) {
        var lines = [];
        var attributes = element.attributes;

        for(var i = 0; i < attributes.length; i++) {
            if (!attributes[i].name.match(config.parseLineRegex)) {
               continue;
            }

            lines.push(attributes[i].value);
        }

        return lines;
    }
});
