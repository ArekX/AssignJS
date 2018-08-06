// @import: core
// @import: component/base.js
// @import: component/props.js

lib(['component', 'config', 'inspect', 'compiler', 'html', 'task', 'assert'],
    function ComponentHandler(component, configManager, inspect, compiler, html, task, assert) {

    var config = configManager.component;

    var renderer = compiler.renderer;
    var parser = compiler.parser;

    var ComponentHandler = {
        _boundBeforeUpdate: null,
        _boundAfterUpdate: null,
        _childIdCounter: 0,
        _bindChild: bindChild,
        element: null,
        elementObject: null,
        parent: null,
        io: null,
        def: null,
        props: null,
        children: null,
        init: initialize,
        bind: bind,
        bindInputProp: bindInputProp,
        initializeView: initializeView,
        propsChanged: propsChanged
    };

    component.handlerFactory.add('base', ComponentHandler);
    component.handlerFactory.setDefaultType('base');

    function initialize(componentDef) {
        this.def = componentDef;
        this.children = {};
        this._childIdCounter = 0;

        this.context = Object.create(componentDef);

        for(var name in componentDef) {
            if (componentDef.hasOwnProperty(name) && inspect.isFunction(componentDef[name])) {
                 this.context[name] = componentDef[name].bind(this.context);
            }
        }

        var propManager = component.propsFactory.create(config.propsType);

        this.props = this.context.props = propManager.bind(this.def.initialProps);
        this.propManager = this.context.propManager = propManager;

        this._boundBeforeUpdate = runBeforeUpdate.bind(this);
        this._boundAfterUpdate = runAfterUpdate.bind(this);

        this.context.handler = this;
    }

    function bind(config) {
        this.element = config.element;
        this.elementObject = inspect.getElementObject(config.element);
        this.elementObject.component = this;

        this.io = this.elementObject.io = config.io;

        this.parent = config.parent;
        this.elementObject.parentComponent = config.parent;
        this.parent && this.parent._bindChild(this, config.ref);

        this.context.parent = this.parent;
        this.context.children = this.children;
        this.context.element = this.element;

        resolveProps(this, config.inputProps);
    }

    function bindChild(child, refName) {
        assert.keyNotSet(refName, this.children, 'This child reference is already set.', {
          ref: refName,
          element: this.element,
          childElement: child.element
        });

        this.children[refName || this._childIdCounter++] = child.context;
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
        parser.parse(self.element);
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

    function bindInputProp(propName, type, initialValue) {
        var inputProps = this.def.inputProps || [];

        var assertResult = false;
        var bindAs = propName;

        if (inspect.isArray(inputProps)) {
            assertResult = inputProps.indexOf(propName) !== -1;
        } else {
            assertResult = propName in inputProps;
            bindAs = inputProps[propName];
        }

        assert.isTrue(
          assertResult,
          'Prop name is not defined in input props.',
          {
              propName: propName,
              inputProps: inputProps,
              element: this.element
          }
        );

        var propManager = this.propManager;

        if (type === 'literal') {
            propManager.set(bindAs, initialValue);
            return;
        }

        assert.isTrue(
          this.parent !== null,
          'This component has no parent to bind property from.',
          {
             property: propName,
             element: this.element
          }
        );

        this.parent.propManager.addChangeListener(
            initialValue,
            function(oldValue, newValue) {
              propManager.set(bindAs, newValue);
            }
        );

        propManager.set(bindAs, this.parent.propManager.get(initialValue));
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

    function resolveProps(component, props) {
          for(var i = 0; i < props.length; i++) {
              var prop = props[i];
              component.bindInputProp.apply(component, prop);
          }
    }
});
