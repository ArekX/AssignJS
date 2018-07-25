// @import: core
lib(['config', 'createFactory', 'assert', 'compiler'], function ComponentsBase(configManager, createFactory, assert, compiler) {

    var config = configManager.component = {
        handlerType: 'base',
        propsType: 'base'
    };

    var componentDefs = {};

    this.component = {
        handlerFactory: createFactory(),
        propsFactory: createFactory(),
        add: addComponent,
        create: createComponent
    };

    function addComponent(name, def) {
        if (!def.handler) {
            def.handler = config.handlerType;
        }

        assert.keyNotSet(name, componentDefs, 'This component already exists.');
        componentDefs[name] = def;
    }

    function createComponent(name) {
        assert.keySet(name, componentDefs, 'This component is not defined.');
        var def = componentDefs[name];
        return this.handlerFactory.create(def.handler, [def]);
    }
});