// @import: compiler

lib(['compiler', 'component', 'assert'], function ComponentParser(compiler, componentManager, assert) {
    var tokenizer = compiler.createTokenizer([
        {
            name: 'name',
            regex: /^\s*[a-zA-Z_][_a-z0-9]+(\.[a-zA-Z_][_a-zA-Z0-9]*)*/
        },
        {
            name: 'ioString',
            regex: /(\s+\|\s+([^:\ ]+)(:([^\ ]+))?)?/,
            parse: function(match) {
                return match[2] + match[3];
            }
        },
        {
            name: 'props',
            regex: /(\s+\<\-(.+))?\s*$/,
            parse: function(match) {
                return match[2].trim();
            }
        }
    ]);

    compiler.addHandler('component', tokenizer.fullMatch, handleComponent);

    function handleComponent(line, element) {
        var result = tokenizer.consume(line);

        assert.isString(result.name, 'Parsed name is not valid.');

        var component = componentManager.create(result.name);

        component.bind(element, result.ioString);

        console.log(result, component);
    }
});