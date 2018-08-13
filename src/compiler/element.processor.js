// @import: compiler/parser.js

lib(['inspect', 'compiler', 'config'],
function(inspect, compiler, configManager) {
    var preprocessors = [];

    var config = configManager.parser.element = {
        selector: '[data-assign]:not([data-asjs-done]), [data-as]:not([data-asjs-done]), [assign]:not([data-asjs-done]), [as]:not([data-asjs-done])',
        initializedAttribute: 'data-asjs-done',
        parseLineRegex: /^(assign|as|data-assign|data-as)(-[^-]+)*$/
    };

    compiler.parser.addProcessor({
        priority: 0,
        parseAll: parseAll,
        parse: parse,
        findActive: findActive
    });

    function parseAll(container) {
        var templates = findActive(container);
        for (var i = 0; i < templates.length; i++) {
            parse(templates[i]);
        }
    }

    function findActive(element) {
        return element.querySelectorAll(config.selector);
    }

    function parse(node) {
        if (inspect.isCompiledElement(node)) {
            return;
        }

        compiler.compileElement(node, compiler.parser.getParseLines(node, config.parseLineRegex));
        node.setAttribute(config.initializedAttribute, true);
    }
});
