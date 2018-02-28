(function(core) {
    "use strict";

    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = ["core.scope", "core.assignments", "core.event.group"];

    function ContainerManagerExtender(scopeManager, assignments, makeEventGroup) {
        var module = this.module;
        module.define("core.base", BaseContainer);
    
        function BaseContainer(trackId) {
            this.owner = null;
            this._isDestroyable = true;
            this.scope = scopeManager.make();
            
            this._trackId = trackId;
            this._payload = null;
            this._children = {};
            this._isUnlinked = false;
            this._parentContainer = null;
            this._assignments = null;
            this.events = makeEventGroup([
                'beforeLink',
                'afterLink',
                'beforeUnlink',
                'afterUnlink'
            ], this);
        }

        BaseContainer.prototype.process = null;
        BaseContainer.prototype.getId = getId;
        BaseContainer.prototype.setPayload = setPayload;
        BaseContainer.prototype.getPayload = getPayload;
        BaseContainer.prototype.isUnlinked = getIsUnlinked;
        BaseContainer.prototype.setupAssignments = setupAssignments;
        BaseContainer.prototype.setParent = setParentContainer;
        BaseContainer.prototype.getParent = getParentContainer;
        BaseContainer.prototype.setDestroyable = setDestroyable;
        BaseContainer.prototype.isDestroyable = getIsDestroyable;
        BaseContainer.prototype.link = linkContainer;
        BaseContainer.prototype.unlink = unlinkContainer;
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
            this.events.trigger('beforeLink', this._assignments);
            assignments.setAssignments(this._assignments, this.scope);
            this.events.trigger('afterLink');
        }

        function setupAssignments(assignments) {
            this._assignments = assignments;
        }

        function getIsUnlinked() {
            return this._isUnlinked;
        }

        function unlinkContainer(force) {
            if (this.isUnlinked()) {
                return;
            }

            if (!this.isDestroyable() && !force) {
                return;
            }

            this._isUnlinked = true;

            this.events.trigger('beforeUnlink');
            
            this.setParent(null);
            this.scope.destroy();
            
            this.events.trigger('afterUnlink');
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

        function setDestroyable(value) {
            this._isDestroyable = value;
        }

        function getIsDestroyable() {
            return this._isDestroyable;
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
    }

})(document.querySelector('script[data-assign-js-core]').$main);