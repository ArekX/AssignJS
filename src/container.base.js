(function(core) {
    core.modules.extend("core.container.manager", ContainerManagerExtender);

    ContainerManagerExtender.deps = ["core.scope"];

    function ContainerManagerExtender(makeScope) {
        this.module.define("core.base", BaseContainer);
    
        function BaseContainer(trackId, payload, parentScope) {
            this.payload = payload;
            this._trackId = trackId;
            this._children = {};
            this._isUnlinked = false;
            this._parentContainer = null;
            this.events = {
                beforeLink: null,
                afterLink: null,
                beforeUnlink: null,
                afterUnlink: null
            };

            this.scope = makeScope();
        }

        BaseContainer.prototype.owner = null;
        BaseContainer.prototype.getId = getId;
        BaseContainer.prototype.isUnlinked = getIsUnlinked;
        BaseContainer.prototype.setParent = setParentContainer;
        BaseContainer.prototype.getParent = getParentContainer;
        BaseContainer.prototype._setChild = setChildContainer;
        BaseContainer.prototype._unsetChild = unsetChildContainer;
        BaseContainer.prototype.link = linkContainer;
        BaseContainer.prototype.unlink = unlinkContainer;
        BaseContainer.prototype.triggerEvent = triggerEvent;

        function getId() {
            return this._trackId;
        }

        function linkContainer(linkItems) {
            this.triggerEvent('beforeLink', linkItems);
            this.scope.assignMultiple(linkItems);
            // todo: You need to track every place this is linked to,
            // because on unlink that needs to be removed.
            this.triggerEvent('afterLink');
        }

        function getIsUnlinked() {
            return this._isUnlinked;
        }

        function unlinkContainer() {
            this.triggerEvent('beforeUnlink');
            // todo: remove all linked things.
            this.setParentContainer(null);
            this.triggerEvent('afterUnlink');
            this._isUnlinked = true;
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
            if (this.events[name]) {
                this.events[name].trigger(data);
            }
        }
    }

})(document.querySelector('script[data-assign-js-core]').$main);