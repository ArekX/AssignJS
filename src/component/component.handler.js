// @import: core
// @import: component/base.js
// @import: component/props.js

lib(['component', 'config', 'inspect', 'io', 'compiler', 'html'], 
    function ComponentHandler(component, configManager, inspect, io, compiler, html) {

    var config = configManager.component;

    var renderer = compiler.renderer;
    var parser = compiler.parser;

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

    function bind(element, ioString) {
        this.element = element;
        this.elementObject = inspect.getElementObject(element);
        this.elementObject.component = this;
        this.io = io.resolve(ioString, {
            element: element,
            component: this
        });
    }

    function render() {
        this.def.beforeRender && this.def.beforeRender();

        var output = this.io.output;
        var def = this.def; 

        if (this.def.template && output.shouldWrite()) {
            renderer.push(function() {
                output.write(html.toRawHtml(def.template));
            });
        }

        this.def.afterRender && this.def.afterRender();
    }
});