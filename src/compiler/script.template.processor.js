// @import: compiler/parser.js

lib(['inspect', 'compiler', 'config'],
function(inspect, compiler, configManager) {
    var preprocessors = [];

    var config = configManager.parser.template = {
        selector: '[data-assign-template-id]:not([data-asjs-t-done]), script[data-as-template-id]:not([data-asjs-t-done]), [assign-template-id]:not([data-asjs-t-done]), [as-template-id]:not([data-asjs-t-done])',
        initializedAttribute: 'data-asjs-t-done',
        parseLineRegex: /^(assign-template-id|as-template-id|data-assign-template-id|data-as-template-id)$/
    };

    compiler.parser.addProcessor({
       priority: 2,
       lines: ['-template-id'],
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

        compiler.setTemplate(lines[0], node.innerHTML);
        node.setAttribute(config.initializedAttribute, true);
    }
});
