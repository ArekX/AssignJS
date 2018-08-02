// @import: compiler

lib(['compiler', 'component', 'assert', 'config'], function ComponentParser(compiler, componentManager, assert, configManager) {

    var config = configManager.component;

    config.defaultIO = '_:~html';

    var tokenizer = compiler.createTokenizer([
        {
            name: 'name',
            regex: /^\s*[a-zA-Z_][_a-z0-9]+(\.[a-zA-Z_][_a-zA-Z0-9]*)*/
        },
        {
            name: 'ioString',
            regex: /(\s+\|\s+([^:\ ]+)(:([^\ ]+))?)?/,
            parse: function(match) {
                if (!match[2] || !match[3]) {
                    return config.defaultIO;
                }

                return match[2] + match[3];
            }
        },
        {
            name: 'props',
            regex: /(\s+\<\-(.+))?\s*$/,
            parse: function(match) {
                if (!match[2]) {
                    return {};
                }

                // TODO: return props object.
                return match[2].trim();
            }
        }
    ]);

    compiler.addHandler('component', tokenizer.fullMatch, handleComponent);

    function handleComponent(line, element) {
        var result = tokenizer.consume(line);

        assert.isString(result.name, 'Parsed name is not valid.');

        var component = componentManager.create(result.name);

        var parentComponent = componentManager.getParent(element);

        component.bind(element, result.ioString);

        if (parentComponent) {
            component.setParent(parentComponent);
        }

        component.initializeView();
    }
});
