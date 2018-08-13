// @import: core
lib(['config', 'createFactory', 'assert', 'compiler', 'inspect'],
function(configManager, createFactory, assert, compiler, inspect) {

    var config = configManager.component = {
        handlerType: 'base',
        propsType: 'base',
        contextType: 'base',
        nameRegex:  /^\s*[a-zA-Z_][_a-zA-Z0-9]+(\.[a-zA-Z_][_a-zA-Z0-9]*)*/
    };

    var propCompileCache = {};

    var componentDefs = {};

    var module = this.component = {
        componentFactory: createFactory(),
        propsFactory: createFactory(),
        add: addComponent,
        create: createComponent,
        createProps: createProps,
        findParent: findParent,
        findContext: findContext,
        compile: compile,
        compileProps: compileProps
    };

    function compile(string, parent, containerTag) {
          var element = document.createElement(containerTag || 'compiled');

          compiler.writeElementObject(element, {
             parentComponent: parent.handler
          });

          element.innerHTML = string;

          if (element.children.length === 1) {
             element = element.children[0];
          }

          compiler.parser.parse(element);

          return element;
    }

    function addComponent(name, def) {
        if (!def) {
            def = name;
        } else {
            def.name = name;
            def = !inspect.isPlainObject(def) ? {template: def, name: name} : def;
        }

        assert.isString(def.name, 'Component name must be defined', {def: def});

        assert.isTrue(
          def.name.match(config.nameRegex) !== null,
          'Component name is invalid.',
          {def: def}
        );

        if (!def.handler) {
            def.handler = config.handlerType;
        }

        assert.keyNotSet(name, componentDefs, 'This component already exists.');
        componentDefs[def.name] = def;

        return module;
    }

    function createComponent(name) {
        assert.keySet(name, componentDefs, 'This component is not defined.');
        var def = componentDefs[name];
        return this.componentFactory.create(def.handler, [def]);
    }

    function createProps(initializer, context) {
        return this.propsFactory.create(config.propsType, [initializer, context]);
    }

    function findParent(element) {
        var ob = inspect.getElementObject(element);

        if (ob.parentComponent) {
           return ob.parentComponent;
        }

        var parent = element;

        while((parent = parent.parentElement) !== null) {
            ob = inspect.getElementObject(parent);

            if (!ob) {
               continue;
            }

            if (ob.component) {
                return ob.component;
            }

            if (ob.parentComponent) {
               return ob.parentComponent;
            }
        }

        return null;
    }

    function findContext(element) {
      do {
          var ob = inspect.getElementObject(element);

          if (ob && ob.context) {
              return ob.context;
          }

          element = element.parentElement;

      } while(element !== null);
    }

    function compileProps(propString) {
        if (propString in propCompileCache) {
            return propCompileCache[propString];
        }

        var checkString = propString;
        var i;
        var tokenCounter = 0;

        var tokenReplacements = [
            {type: 'strings', regex: /\".+?\"/},
            {type: 'json', regex: /\(.+?\)/},
            {type: 'params', regex: /[@%~][^\ \,]+/}
        ];

        var tokens = {};
        for(i = 0; i < tokenReplacements.length; i++) {
           var tokenType = tokenReplacements[i];

           var match = null;

           while((match = checkString.match(tokenType.regex)) !== null) {
               var tokenId = "<t-" + tokenType.type + ":" + (tokenCounter++) + ">";
               tokens[tokenId] = match[0];
               checkString = checkString.replace(match[0], tokenId);
           }
        }

        var params = checkString.split(/,\ ?/);

        for(i = 0; i < params.length; i++) {
            do {
               var continueNext = false;
               for(var token in tokens) {
                   if (!tokens.hasOwnProperty(token) || params[i].indexOf(token) === -1) {
                       continue;
                   }

                   params[i] = params[i].replace(token, tokens[token]);
                   continueNext = true;
               }
            } while(continueNext);
        }

        return propCompileCache[propString] = params;
    }
});
