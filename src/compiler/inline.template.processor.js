// @import: compiler/parser.js

lib(['inspect', 'compiler', 'config'],
function(inspect, compiler, configManager) {
    var preprocessors = [];

    var config = configManager.parser.template = {
        selector: '[data-assign-template]:not([data-asjs-t-done]), [data-as-template]:not([data-asjs-t-done]), [assign-template]:not([data-asjs-t-done]), [as-template]:not([data-asjs-t-done])',
        initializedAttribute: 'data-asjs-t-done',
        parseLineRegex: /^(assign-template|as-template|data-assign-template|data-as-template)$/
    };

    compiler.parser.addProcessor({
       priority: 1,
       lines: ['-template'],
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
        if (inspect.isCompiledTemplate(node)) {
            return;
        }

        if (node.parentElement === null) {
            return;
        }

        var lines = compiler.parser.getParseLines(node, config.parseLineRegex);

        compiler.compileTemplate(node, lines[0]);
        node.setAttribute(config.initializedAttribute, true);
    }
});
