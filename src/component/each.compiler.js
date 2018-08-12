lib(['compiler', 'config', 'inspect', 'assert', 'io', 'component', 'task'],
function (compiler, configManager, inspect, assert, ioManager, componentManager, task) {

  var config = configManager.component.eachCompiler = {
      io: '_:~html',
      tokenizerConfig: [
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
      ]
  };

  var renderer = compiler.renderer;
  var parser = compiler.parser;

  var tokenizer = compiler.createTokenizer(config.tokenizerConfig);

  compiler.addHandler('each.compiler', tokenizer.fullMatch, handleComponent);

  function UnsetValue() {}

  function handleComponent(line, element) {
      var result = tokenizer.consume(line);
      var propName = result.name;
      var keyName = result.values.key;
      var valueName = result.values.value;
      var ob = inspect.getElementObject(element);

      var context = componentManager.findContext(element);

      assert.isTrue(context !== null, 'Context for prop not found.', {
         prop: result.name,
         element: element
      });

      var template = ob.template || "";

      var io = ob.io = ioManager.resolve(element, config.io);
      var output = outputResult.bind(io.output);
      var currentValue = [];
      var resultItems = [];

      handleValue(context.get(result.name));

      context.changed.register(function() {
          handleValue(context.get(result.name));
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
         var el = document.createElement('item-tpl');
         el.innerHTML = template;

         el = el.children.length === 1 ? el.children[0] : el;

         var childContext = context.createChild(function() {
             var props = {};

             if (keyName) {
                 props[keyName] = index;
             }

             props[valueName] = item;

             return props;
         });

         compiler.writeElementObject(el, {context: childContext});
         var pName = propName + '.' + index;

         context.changed.register(function() {
             currentValue[index] = context.get(pName);
             childContext.set(valueName, currentValue[index]);
         }, UnsetValue);

         return el;
      }
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
