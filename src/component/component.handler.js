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
        pipeline: null,
        init: initialize,
        bind: bind,
        initializeView: initializeView,
        runBeforeUpdate: runBeforeUpdate,
        runAfterUpdate: runAfterUpdate
    };

    component.handlerFactory.add('base', ComponentHandler);
    component.handlerFactory.setDefaultType('base');

    function initialize(componentDef) {
        this.def = componentDef;

        var propManager = component.propsFactory.create(config.propsType);

        this.methods = {};
        var defMethods = this.def.methods || {};

        for(var methodName in defMethods) {
           if (defMethods.hasOwnProperty(methodName)) {
               this.methods[methodName] = defMethods[methodName].bind(this);
           }
        }

        this.props = propManager.bindProps(this.def.props);
        this.propManager = propManager;

        this.def.init && this.def.init.call(this);
    }

    function bind(element, ioString, pipeline) {
        this.element = element;
        this.elementObject = inspect.getElementObject(element);
        this.elementObject.component = this;
        this.io = this.elementObject.io = io.resolve(ioString, {
            element: element,
            component: this
        });
        this.pipeline = pipeline;
        this.pipeline.afterRunOnce = runAfterUpdate.bind(this);
        this.pipeline.beforeRunOnce = runBeforeUpdate.bind(this);
    }

    function initializeView() {
        var self = this;
        var def = self.def;

        def.beforeViewInit && def.beforeViewInit.call(self);

        if (def.template) {
            var output = self.io.output;
            self.pipeline.push(function() {
              output.write(html.toRawHtml(def.template));
              runAfterInit();
            });
        } else {
            runAfterInit();
        }

        function runAfterInit() {
            parser.parseAll(self.element);
            def.afterViewInit && def.afterViewInit.call(self);
        }
    }

    function runBeforeUpdate() {
        this.def.beforeUpdate && this.def.beforeUpdate.call(this);
    }

    function runAfterUpdate() {
        this.def.afterUpdate && this.def.afterUpdate.call(this);
    }
});
