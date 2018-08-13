lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component', 'task'],
function (compiler, configManager, inspect, assert, ioManager, componentManager, task) {

  var config = configManager.component.eachCompiler = {
      io: '_:~html',
      tplElementName: 'item-tpl',
      tokenizer: compiler.createTokenizer([
          {
              name: 'eachType',
              regex: /^\s*~each\:/
          },
          {
              name: 'name',
              regex: /[^\ ]+\s+/,
              parse: parsePropName
          },
          {
              name: 'as',
              regex: /\-\>\s*/
          },
          {
              name: 'values',
              regex: /(([^\ \,]+)\s*\,)?\s*([^\ ]+)$/,
              parse: parseValues
          }
      ])
  };

  var renderer = compiler.renderer;
  var parser = compiler.parser;

  compiler.addHandler('each.compiler', matchEachCompiler, handleComponent);

  function UnsetValue() {}

  function handleComponent(line, element) {
      var tokens = config.tokenizer.consume(line);
      var propName = tokens.name;
      var keyName = tokens.values.key;
      var valueName = tokens.values.value;
      var ob = inspect.getElementObject(element);

      var context = componentManager.findContext(element);

      var contextMethods = context.methods;
      context = context.props;

      assert.isTrue(context !== null, 'Context for prop not found.', {
         prop: tokens.name,
         element: element
      });

      var template = ob.template || "";

      var io = ob.io = ioManager.resolve(element, config.io);
      var output = outputResult.bind(io.output);
      var currentValue = [];
      var resultItems = [];

      handleValue(context.get(tokens.name));

      context.changed.register(function() {
          handleValue(context.get(tokens.name));
          task.push(output, null, true);
      }, UnsetValue);

      task.push(output, null, true);

      function handleValue(value) {
          value = value instanceof UnsetValue ? [] : value;
          if (!inspect.isArray(value)) {
              value = [];
          }

          var oldResults = resultItems;
          resultItems = [];

          for(var i = 0; i < value.length; i++) {
              if (i === currentValue.length) {
                 resultItems.push(renderItem(value[i], i));
                 currentValue.push(value[i]);
              } else if (value[i] === currentValue[i]) {
                 resultItems.push(i in oldResults ? oldResults[i] : renderItem(value[i], i));
              } else {
                 resultItems[i] = renderItem(value[i], i);
              }
          }
      }

      function outputResult() {
          this.write(resultItems);
          parser.parse(element);
      }

      function renderItem(item, index) {
         var el = document.createElement(config.tplElementName);
         el.innerHTML = template;

         el = el.children.length === 1 ? el.children[0] : el;

         var pName = propName + '.' + index;

         var bindProps = {};
         bindProps[pName] = valueName;

         var childContext = context.createChild(function() {
             var props = {};

             if (keyName) {
                 props[keyName] = index;
             }

             props[valueName] = context.get(pName);

             return props;
         }, bindProps);

         compiler.writeElementObject(el, {context: {
            props: childContext,
            methods: contextMethods
         }});

         return el;
      }
  }

  function matchEachCompiler(line, element) {
      return config.tokenizer.match(line);
  }

    function parsePropName(match, result) {
        return match[0].trim();
    }

    function parseValues(match, result) {
        return {
            key: match[2],
            value: match[3]
        };
    }
});
