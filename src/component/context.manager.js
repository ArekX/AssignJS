
lib(['component', 'object'], function(component, object) {
    var ContextManager = {
        _manager: null,
        _subscriptions: null,
        _remapper: null,
        _childId: null,
        _children: null,
        _values: {},
        parent: null,
        init: init,
        createChild: createChild,
        listen: listen,
        resolveName: resolveName,
        remap: remap,
        createProp: createProp,
        getValue: getValue,
        destroy: destroy
    };

    component.contextFactory.add('base', ContextManager);
    component.contextFactory.setDefaultType('base');

    function init(propsManager) {
        this._manager = propsManager;
        this._subscriptions = [];
        this._remapper = {};
        this._childId = 0;
        this._children = {};
        this._values = {};
    }

    function listen(name, callback) {
        var self = this;
        var oldValue = self.getValue(name);
        var subscription = this._manager.changed.register(function() {
            var newValue = self.getValue(name);
            if (oldValue !== newValue) {
                callback(newValue);
                oldValue = newValue;
            }
        });
        this._subscriptions.push(subscription);
    }

    function getValue(propName) {
        propName = this.resolveName(propName);

        if (propName in this._values) {
            return this._values[propName];
        }

        return this._manager.get(propName);
    }

    function resolveName(propName) {
        return this._remapper[propName] || propName;
    }

    function remap(name, toName) {
        this._remapper[name] = toName;
    }

    function createProp(name, value) {
        this._values[name] = value;
    }

    function createChild() {
        var childContext = component.createContext(this._manager);
        childContext.parent = this;
        this._children[this._childId++] = childContext;
        return childContext;
    }

    function destroy() {
        for(var childId in this._children) {
            if (this._children.hasOwnProperty(childId)) {
                this._children[childId].destroy();
                delete this._children[childId];
            }
        }

        for(var i = 0; i < this._subscriptions.length; i++) {
            this._subscriptions[i].remove();
        }
    }
});
