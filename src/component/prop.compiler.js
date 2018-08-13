lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component', 'task'],
function (compiler, configManager, inspect, assert, ioManager, componentManager, task) {

  var config = configManager.component.propCompiler = {
      eventIo: '_:_',
      propIo: '_:~html',
      tokenizer: compiler.createTokenizer([
          {
              name: 'event',
              regex: /^\s*([^\#\@]*)/,
              parse: parseEventName
          },
          {
              name: 'bindTo',
              regex: /(@@?|#)/
          },
          {
              name: 'name',
              regex: /([^\ \(\)]+)(\(([^\)]*)\))?\s*/,
              parse: parsePropName
          },
          {
              name: 'ioString',
              regex: /(\|\s+([^:\ ]+)(:([^\ ]+))?)?$/,
              parse: parseIoString
          }
      ])
  };

  var renderer = compiler.renderer;
  var parser = compiler.parser;

  compiler.addHandler('prop.compiler', matchPropCompiler, handleComponent);

  function UnsetValue() {}

  function handleComponent(line, element) {
      var tokens = config.tokenizer.consume(line);
      var ob = inspect.getElementObject(element);

      var context = componentManager.findContext(element);

      assert.isTrue(context !== null, 'Context for prop not found.', {
         prop: tokens.name,
         element: element
      });

      ob.context = context;

      var io = ob.io = ioManager.resolve(element, tokens.ioString);

      if (tokens.bindTo === '@' || tokens.bindTo === '@@') {
          resolvePropBinding(tokens, context.props);
      } else {
          resolveMethodBinding(tokens, context.methods);
      }

      function resolvePropBinding(tokens, context) {
          var currentValue = context.get(tokens.name);

          var output = function() {
              io.output.write(currentValue);
              parser.parse(element);
          };

          context.listen(tokens.name, function(newValue) {
              currentValue = newValue instanceof UnsetValue ? '' : newValue;
              pushWriteTask();
          }, UnsetValue);

          if (tokens.bindTo === '@') {
              pushWriteTask();
          }

          if (tokens.event) {
              element.addEventListener(tokens.event, function() {
                  if (!io.input.canRead) {
                      context.update();
                  } else {
                      context.set(tokens.name, io.input.read());
                  }
              });
          }

          function pushWriteTask() {
              io.output.shouldWrite(currentValue) && task.push(output, null, true);
          }
      }

      function resolveMethodBinding(tokens, context) {
        assert.isTrue(tokens.event !== null, 'Event must be defined for method binding.', {
           method: tokens.name,
           element: element
        });

        element.addEventListener(tokens.event, function() {
             context[tokens.name].call(context);
        });
      }
  }

  function matchPropCompiler(line, element) {
      return config.tokenizer.match(line);
  }

  function parseEventName(match) {
      return match[0] ? match[0] : null;
  }

  function parsePropName(match, result) {
      console.log(match);
      return match[0].trim();
  }

  function parseIoString(match, result) {
      if (!match[2] || !match[3]) {
          return result.bindTo === '@' || result.bindTo === '@@' ?
                 config.propIo : config.eventIo;
      }

      return match[2] + match[3];
  }
});
