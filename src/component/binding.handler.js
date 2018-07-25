// @import: events

lib(['compiler', 'config', 'inspect'], function ComponentBindingHandler(compiler, configManager, inspect) {
    
    var config = configManager.component.binding = {
        defaultWriteIo: '_:~html',
        defaultEventIo: '_:_'
    };

    var renderer = compiler.renderer;
    var parser = compiler.parser;

    var tokenizer = compiler.createTokenizer([
        {
            name: 'event',
            regex: /^\s*[^\#\@]*/
        },
        {
            name: 'eventType',
            regex: /(@|#)/
        },
        {
            name: 'prop',
            regex: /[^\ ]+\s*/
        },
        {
            name: 'ioString',
            regex: /(\|\s+([^:\ ]+)(:([^\ ]+))?)?$/,
            parse: function(match, result) {
                if (!match[2] || !match[3]) {
                    return result.eventType === '@' ? config.defaultWriteIo : config.defaultEventIo;
                }

                return match[2] + match[3];
            }
        }
    ]);

    compiler.addHandler('component.binding', tokenizer.fullMatch, handleComponent);

    function handleComponent(line, element) {
        var result = tokenizer.consume(line);

        var parent = element;
        var parentOb = null;

        while((parent = parent.parentElement) !== null) {
            var ob = inspect.getElementObject(parent);
            if (ob && ob.component) {
                parentOb = ob;
                break;
            }
        }

        var component = parentOb.component;

        // TODO: throw error if parent ob is null
        element.innerHTML = component.props[result.prop];
    }
});