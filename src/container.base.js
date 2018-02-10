(function(core) {
    "use strict";

    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = ["core.scope", "core.assignments", "core.event"];

    function ContainerManagerExtender(makeScope, assignments, makeEventEmitter) {
        var module = this.module;
        module.define("core.base", BaseContainer);
    
        function BaseContainer(trackId) {
            this.owner = null;
            this.scope = makeScope();
            
            this._trackId = trackId;
            this._payload = null;
            this._children = {};
            this._isUnlinked = false;
            this._parentContainer = null;
            this._assignments = null;
            this._events = {
                beforeLink: null,
                afterLink: null,
                beforeUnlink: null,
                afterUnlink: null
            };
        }

        BaseContainer.prototype.process = null;
        BaseContainer.prototype.getId = getId;
        BaseContainer.prototype.setPayload = setPayload;
        BaseContainer.prototype.getPayload = getPayload;
        BaseContainer.prototype.isUnlinked = getIsUnlinked;
        BaseContainer.prototype.setupAssignments = setupAssignments;
        BaseContainer.prototype.setParent = setParentContainer;
        BaseContainer.prototype.registerEvent = registerEvent;
        BaseContainer.prototype.unregisterEvent = unregisterEvent;
        BaseContainer.prototype.getParent = getParentContainer;
        BaseContainer.prototype.link = linkContainer;
        BaseContainer.prototype.unlink = unlinkContainer;
        BaseContainer.prototype.triggerEvent = triggerEvent;
        BaseContainer.prototype._unsetChild = unsetChildContainer;
        BaseContainer.prototype._setChild = setChildContainer;

        function getId() {
            return this._trackId;
        }

        function setPayload(payload) {
            this._payload = payload;
        }

        function getPayload() {
            return this._payload;
        }

        function linkContainer() {
            this.triggerEvent('beforeLink', this._assignments);
            assignments.assignToScope(this._assignments, this.scope);
            this.triggerEvent('afterLink');
        }

        function setupAssignments(assignments) {
            this._assignments = assignments;
        }

        function getIsUnlinked() {
            return this._isUnlinked;
        }

        function unlinkContainer() {
            this.triggerEvent('beforeUnlink');
            
            this.setParent(null);
            this.scope.destroy();
            this._isUnlinked = true;
            
            this.triggerEvent('afterUnlink');
        }

        function setParentContainer(container) {
            var parent = this._parentContainer;

            if (parent) {
                this.scope.setParent(null);
                parent._unsetChild(this);
                this._parentContainer = null;
            }

            if (container) {
                container._setChild(this);

                this.scope.setParent(container.scope);
                this._parentContainer = container;
            }
        }

        function getParentContainer() {
            return this._parentContainer;
        }

        function setChildContainer(container) {
            this._children[container.getId()] = container;
        }

        function unsetChildContainer(container) {
            var trackId = container.getId();

            if (trackId in this._children) {
                delete this._children[trackId];
            }
        }

        function triggerEvent(name, data) {
            if (this._events[name]) {
                this._events[name].trigger(data);
            }
        }

        function registerEvent(eventName, namespace, callback) {
            if (!this._events[eventName]) {
                this._events[eventName] = makeEventEmitter(this);
            }

            this._events[eventName].register(namespace, callback);
        }

        function unregisterEvent(eventName, namespace, callback) {
            if (!this._events[eventName]) {
                return;
            }

            this._events[eventName].unregister(namespace, callback);
        }
    }

})(document.querySelector('script[data-assign-js-core]').$main);