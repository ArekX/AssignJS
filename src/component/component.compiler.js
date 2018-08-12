// @import: compiler
// @import: io

lib(['compiler', 'component', 'assert', 'config', 'io', 'inspect', 'object'],
function(compiler, componentManager, assert, configManager, io, inspect, object) {

    var config = configManager.component.compiler = {
        defaultIO: '_:~html',
        propRegex: /[^ ,:]+:(\(.+?\)|[^ ,]+)/g,
        individualPropRegex: /([^ ,:]+):(\((.+?)\)|([^ ,]+))/,
        propNameRegex: /(data-prop|\[prop)-([^\]]+)\]?/,
        refNameRegex: /(data-ref|\[ref\])/,
        tokenizerConfig: [
            {
                name: 'name',
                regex: configManager.component.nameRegex
            },
            {
                name: 'ref',
                regex: /(:\s*[a-zA-Z_][_a-zA-Z0-9]+(\.[a-zA-Z_][_a-zA-Z0-9]*)*)?/,
                parse: parseRef
            },
            {
                name: 'ioString',
                regex: /(\s+\|\s+([^:\ ]+)(:([^\ ]+))?)?/,
                parse: parseIo
            },
            {
                name: 'inputProps',
                regex: /(\s+\<\-(.+))?\s*$/,
                parse: parseProps
            }
        ]
    };

    function InvalidParamValue() {}

    var tokenizer = compiler.createTokenizer(config.tokenizerConfig);

    compiler.addHandler('component.compiler', tokenizer.fullMatch, handleComponent);

    function handleComponent(line, element) {
        var result = tokenizer.consume(line, element);

        var elementObject = inspect.getElementObject(element);

        assert.isString(result.name, 'Parsed name is not valid.');

        var component = componentManager.create(result.name);
        var parentComponent = componentManager.findParent(element);

        component.bind({
            element: element,
            io: io.resolve(element, result.ioString),
            parent: parentComponent,
            inputProps: result.inputProps,
            ref: result.ref
        });

        elementObject.parentComponent = parentComponent;

        elementObject.parentChanged = function(oldParent, newParent) {
            newParent === null && component.destroy();
        };

        elementObject.context = component.props;

        component.initializeView();
    }

    function parseIo(match) {
        if (!match[2] || !match[3]) {
            return config.defaultIO;
        }

        return match[2] + match[3];
    }

    function parseProps(match, result, element) {
        if (!match[2]) {
            return [];
        }
        var props = match[2].trim()
              .match(config.propRegex)
              .map(function(param) {
                    return param.match(config.individualPropRegex);
              })
              .reduce(function(acc, match) {
                  if (match[4]) {
                     acc.push(getParentPropValue(match[1], match[4]));
                     return acc;
                  }
                  acc.push(getLiteralValue(match[3], match[1], element));
                  return acc;
              }, []);

       runForAttributes(element, config.propNameRegex, function(attribute) {
           var value = attribute.value;

           if (value.match(/^\s*\(.+\)\s*$/)) {
                value = getLiteralValue(
                  value.substring(1, value.length - 1),
                  propMatch[2],
                  element
                );
           } else {
                 value = getParentPropValue(propMatch[2], value);
           }

           props.push(value);
       });

        return props;
    }

    function getLiteralValue(literalString, param, element) {
        var value = object.parseJson(literalString, InvalidParamValue);

        assert.isFalse(
          value === InvalidParamValue,
          "Cannot parse param. Invalid Value.", {
            param: param,
            valueToParse: literalString,
            element: element
        });

        return [param, 'literal', value];
    }

    function getParentPropValue(param, value) {
        return [param, 'parentProp', value];
    }

    function parseRef(match, result, element) {
      if (match[0]) {
         return match[0].substring(1);
      }

      var ref = null;

      runForAttributes(element, config.refNameRegex, function(attribute) {
          ref = attribute.value;
      });

      return ref;
    }

    function runForAttributes(element, attributeRegex, run) {
      for(var i = 0; i < element.attributes.length; i++) {
          var attribute = element.attributes[i];
          var propMatch = attribute.name.match(attributeRegex);

          if (!propMatch) {
             continue;
          }

          run(attribute);
      }
    }
});
