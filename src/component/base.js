// @import: core
lib(['config', 'createFactory', 'assert', 'compiler'], function ComponentsBase(configManager, createFactory, assert, compiler) {

    var config = configManager.component = {
        handlerType: 'base',
        propsType: 'base'
    };

    var components = {};

    this.component = {
        handlerFactory: createFactory(),
        propsFactory: createFactory(),
        add: addComponent
    };

    function addComponent(name, def) {
        if (!def.handler) {
            def.handler = config.handlerType;
        }

        assert.keyNotSet(name, components, 'This component already exists.');
        components[name] = def;
    }
});