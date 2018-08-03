// @import: events

lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component', 'task'],
function ComponentBindingHandler(compiler, configManager, inspect, assert, ioManager, componentManager, task) {

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
            name: 'name',
            regex: /[^\ ]+\s*/,
            parse: function(match, result) {
                return match[0].trim();
            }
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

        var component = componentManager.findParent(element);
        var elementObject = inspect.getElementObject(element);

        assert.isTrue(component !== null, 'Parent component not found.');

        var props = component.propManager;

        var io = elementObject.io = ioManager.resolve(element, result.ioString);

        var handlers = result.eventType === '@' ? component.props : component.methods;

        var output = outputResult.bind(io.output);

        props.addChangeListener(result.name, function() {
            task.push(output, null, true);
        });

        task.push(output, null, true);

        if (!result.event) {
            return;
        }

        element.addEventListener(result.event, function() {
            // TODO: we will implement function calls and argument passing in bindings... props will be implemented for now.
            if (inspect.isFunction(handlers[result.name])) {
                handlers[result.name]();
                return;
            }

            handlers[result.name] = io.input.read();
        });

        function outputResult() {
            var value = result.name in handlers ? handlers[result.name] : '';

            if (!io.output.shouldWrite(value)) {
                return;
            }

            io.output.write(value);
            parser.parseAll(element);
        }
    }
});
