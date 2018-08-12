lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component', 'task'],
function (compiler, configManager, inspect, assert, ioManager, componentManager, task) {

  var config = configManager.component.propCompiler = {
      eventIo: '_:_',
      propIo: '_:~html',
      tokenizerConfig: [
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
              parse: parsePropName
          },
          {
              name: 'ioString',
              regex: /(\|\s+([^:\ ]+)(:([^\ ]+))?)?$/,
              parse: parseIoString
          }
      ]
  };

  var renderer = compiler.renderer;
  var parser = compiler.parser;

  var tokenizer = compiler.createTokenizer(config.tokenizerConfig);

  compiler.addHandler('prop.compiler', tokenizer.fullMatch, handleComponent);

  function handleComponent(line, element) {
      var result = tokenizer.consume(line);
      var ob = inspect.getElementObject(element);

      var context = findContext(element);

      var io = ob.io = ioManager.resolve(element, result.ioString);
      var output = outputResult.bind(io.output);
      var currentValue = context.getValue(result.name);

      context.listen(result.name, function(newValue) {
          currentValue = newValue;
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
          this.write(currentValue);
          parser.parse(element);
      }
  }

  function findContext(element) {
    var ob = inspect.getElementObject(element);

    var parent = element;

    while((parent = parent.parentElement) !== null) {
        ob = inspect.getElementObject(parent);

        if (!ob) {
           continue;
        }

        if (ob.context) {
            return ob.context;
        }
    }

    assert.isTrue(false, 'Context for prop not found.', {
       prop: result.name,
       element: element
    });
  }

  function parsePropName(match, result) {
      return match[0].trim();
  }

  function parseIoString(match, result) {
      if (!match[2] || !match[3]) {
          return result.eventType === '@' ? config.propIo : config.eventIo;
      }

      return match[2] + match[3];
  }
});
