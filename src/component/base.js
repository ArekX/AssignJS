// @import: core
lib(['config', 'createFactory', 'assert', 'compiler', 'inspect'],
  function ComponentsBase(configManager, createFactory, assert, compiler, inspect) {

    var config = configManager.component = {
        handlerType: 'base',
        propsType: 'base',
        nameRegex:  /^\s*[a-zA-Z_][_a-zA-Z0-9]+(\.[a-zA-Z_][_a-zA-Z0-9]*)*/
    };

    var componentDefs = {};

    var module = this.component = {
        handlerFactory: createFactory(),
        propsFactory: createFactory(),
        add: addComponent,
        create: createComponent,
        findParent: findParent,
        compile: compile
    };

    function compile(string, parent, container) {
          var element = container || document.createElement('compiled');

          compiler.writeElementObject(element, {
             parentComponent: parent.handler
          });

          element.innerHTML = string;

          compiler.parser.parseAll(element);

          return element;
    }

    function addComponent(name, def) {
        assert.isTrue(
          name.match(config.nameRegex) !== null,
          'Component name is invalid.',
          {name: name, def: def}
        );

        def = !inspect.isPlainObject(def) ? {template: def} : def;

        if (!def.handler) {
            def.handler = config.handlerType;
        }

        assert.keyNotSet(name, componentDefs, 'This component already exists.');
        componentDefs[name] = def;

        return module;
    }

    function createComponent(name) {
        assert.keySet(name, componentDefs, 'This component is not defined.');
        var def = componentDefs[name];
        return this.handlerFactory.create(def.handler, [def]);
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
});
