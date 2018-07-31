// @import: events

lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component'],
function ComponentBindingHandler(compiler, configManager, inspect, assert, ioManager, componentManager) {

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

        var component = componentManager.getParent(element);
        var elementObject = inspect.getElementObject(element);

        assert.isTrue(component !== null, 'Parent component not found.');

        var props = component.propManager;

        var io = elementObject.io = ioManager.resolve(result.ioString, {
            element: element
        });

        var handlers = result.eventType === '@' ? component.props : component.methods;

        var pipeline = component.pipeline.branch();

        var output = outputResult.bind(io.output);

        props.addChangeListener(result.name, function() {
            pipeline.pushOnce(output);
        });

        if (!result.event) {
            return;
        }

        element.addEventListener(result.event, function() {
            // TODO: we will implement function calls and argument passing in bindings... props will be implemented for now.
            if (inspect.isFunction(handlers[result.name])) {
                handlers[result.name]();
                return;
            }

              // console.log(io.input.read());
            handlers[result.name] = io.input.read();
        });

        function outputResult() {
            io.output.write(handlers[result.name]);
            parser.parseAll(element);
        }
    }
});
