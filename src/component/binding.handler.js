// @import: events

lib(['compiler', 'config', 'inspect', 'assert', 'io'], 
function ComponentBindingHandler(compiler, configManager, inspect, assert, ioManager) {
    
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

        var component = getParentComponent(element);
        var elementObject = inspect.getElementObject(element);

        assert.isTrue(component !== null, 'Parent component not found.');

        var props = component.props.$manager;

        elementObject.io = ioManager.resolve(result.ioString, {
            element: element
        });

        props.changed.register(function() {
            renderer.render(element, props.get(result.prop));
        });

        renderer.render(element, props.get(result.prop));
    }

    function getParentComponent(element) {
        var parent = element;

        while((parent = parent.parentElement) !== null) {
            var ob = inspect.getElementObject(parent);
            if (ob && ob.component) {
                return ob.component;
            }
        }

        return null;
    }
});