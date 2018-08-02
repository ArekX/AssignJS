// @import: core
// @import: component/base.js
// @import: component/props.js

lib(['component', 'config', 'inspect', 'io', 'compiler', 'html', 'task'],
    function ComponentHandler(component, configManager, inspect, io, compiler, html, task) {

    var config = configManager.component;

    var renderer = compiler.renderer;
    var parser = compiler.parser;

    var ComponentHandler = {
        element: null,
        elementObject: null,
        parent: null,
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
        this.def = componentDef;
        this.context = Object.create(componentDef);

        for(var name in componentDef) {
            if (componentDef.hasOwnProperty(name) && inspect.isFunction(componentDef[name])) {
                 this.context[name] = componentDef[name].bind(this.context);
            }
        }

        var propManager = component.propsFactory.create(config.propsType);

        this.props = this.context.props = propManager.bind(this.def.props || {});
        this.propManager = this.context.propManager = propManager;

        this._boundBeforeUpdate = runBeforeUpdate.bind(this);
        this._boundAfterUpdate = runAfterUpdate.bind(this);

        this.context.handler = this;
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

        this.context.beforeViewInit && this.context.beforeViewInit();

        task.push(function() {
            renderTemplate(self);
        });

        task.afterRunOnce(runAfterInit.bind(this));
    }

    function renderTemplate(self) {
        var def = self.def;

        if (!def.template) {
            return;
        }

        var result = null;

        if (inspect.isFunction(def.template)) {
            result = def.template(this.context);
        } else {
            result = def.template;
        }

        if (inspect.isString(result)) {
            result = html.toRawHtml(result);
        }

        self.io.output.write(result !== null ? result : '');
        parser.parseAll(self.element);
    }

    function runAfterInit() {
        this.context.afterViewInit && this.context.afterViewInit();

        this.context.initialized = true;

        if (inspect.isFunction(this.def.template)) {
            var self = this;
            this.propManager.changed.register(function() {
                task.push(function() {
                    renderTemplate(self);
                });
            });
        }

        this.propManager.changed.register(this.propsChanged.bind(this));
    }

    function propsChanged() {
        task.beforeRunOnce(this._boundBeforeUpdate);
        task.afterRunOnce(this._boundAfterUpdate);

        this.context.afterPropsChanged && this.context.afterPropsChanged();
    }

    function runBeforeUpdate() {
        this.parent && this.parent._boundBeforeUpdate();
        this.context.beforeUpdate && this.context.beforeUpdate();
    }

    function runAfterUpdate() {
        this.context.afterUpdate && this.context.afterUpdate();
        this.parent && this.parent._boundAfterUpdate();
    }
});
