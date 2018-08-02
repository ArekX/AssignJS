// @import: core
// @import: component/base.js
// @import: component/props.js

lib(['component', 'config', 'inspect', 'io', 'compiler', 'html', 'task'],
    function ComponentHandler(component, configManager, inspect, io, compiler, html, task) {

    var config = configManager.component;

    var id = 0;

    var renderer = compiler.renderer;
    var parser = compiler.parser;

    var ComponentHandler = {
        element: null,
        elementObject: null,
        parent: null,
        rendered: false,
        io: null,
        def: null,
        props: null,
        init: initialize,
        bind: bind,
        initializeView: initializeView,
        propsChanged: propsChanged,
        setParent: setParent,
        _boundBeforeUpdate: null,
        _boundAfterUpdate: null
    };

    component.handlerFactory.add('base', ComponentHandler);
    component.handlerFactory.setDefaultType('base');

    function initialize(componentDef) {
        this.id = id++;
        this.def = componentDef;

        this.waitingChildComponents = [];

        var propManager = component.propsFactory.create(config.propsType);

        this.methods = {};
        var defMethods = this.def.methods || {};

        for(var methodName in defMethods) {
           if (defMethods.hasOwnProperty(methodName)) {
               this.methods[methodName] = defMethods[methodName].bind(this);
           }
        }

        this.props = propManager.bind(this.def.props || {});
        this.propManager = propManager;

        this.propManager.changed.register(this.propsChanged.bind(this));
        this._boundBeforeUpdate = runBeforeUpdate.bind(this);
        this._boundAfterUpdate = runAfterUpdate.bind(this);

        this.def.init && this.def.init.call(this);
    }

    function bind(element, ioString) {
        this.element = element;
        this.elementObject = inspect.getElementObject(element);
        this.elementObject.component = this;
        this.io = this.elementObject.io = io.resolve(ioString, {
            element: element,
            component: this
        });
    }

    function setParent(parent) {
        this.parent = parent;
    }

    function initializeView() {
        var self = this;
        var def = self.def;

        def.beforeViewInit && def.beforeViewInit.call(self);

        task.push(function() {
            if (def.template) {
               var output = self.io.output;
               output.write(html.toRawHtml(def.template));
               parser.parseAll(self.element);
            }
        });

        task.afterRunOnce(runAfterInit.bind(this));
    }

    function runAfterInit() {
        this.def.afterViewInit && this.def.afterViewInit.call(this);
        this.rendered = true;
    }

    function propsChanged() {
        if (this.rendered) {
            task.beforeRunOnce(this._boundBeforeUpdate);
            task.afterRunOnce(this._boundAfterUpdate);
        }

        this.def.afterPropsChanged && this.def.afterPropsChanged.call(this);
    }

    function runBeforeUpdate() {
        this.parent && this.parent._boundBeforeUpdate();
        this.def.beforeUpdate && this.def.beforeUpdate.call(this);
    }

    function runAfterUpdate() {
        this.def.afterUpdate && this.def.afterUpdate.call(this);
        this.parent && this.parent._boundAfterUpdate();
    }
});
