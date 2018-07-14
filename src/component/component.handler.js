// @import: core
// @import: events/base.js

lib(['component', 'config', 'inspect', 'io'], 
    function ComponentHandler(component, configManager, inspect, io) {
    
    var config = configManager.component;

    config.defaultIO = '_:~html';

    var ComponentHandler = {
        element: null,
        elementObject: null,
        io: null,
        def: null,
        props: null,
        init: initialize,
        bind: bind,
        render: render
    };

    component.handlerFactory.add('base', ComponentHandler);
    component.handlerFactory.setDefaultType('base');

    function initialize(componentDef) {
        this.def = componentDef;
        
        var props = component.propsFactory.create(config.propsType);
        this.props = props.initializeDefinition(this.def.props, {});
        
        this.def.init && this.def.init();
    }

    function bind(element) {
        this.element = element;
        this.elementObject = inspect.getElementObject(element);
        this.io = io.resolve(ioString, {
            element: element,
            component: this
        });
    }

    function render() {
        this.def.beforeRender && this.def.beforeRender();
        
        if (this.def.template) {
            this.io.output.write();
        }

        this.def.afterRender && this.def.afterRender();
    }
});