(function(core) {
    "use strict";

    core.modules.define("core.container.manager", ContainerManagerModule);

    ContainerManagerModule.deps = ["core.parser", "core.manager.base"];

    function ContainerManagerModule(parser, managerMaker) {
        function ContainerManager() {
            this.trackId = 1;
            this.containers = {};
            this.pendingContainers = [];
        }

        ContainerManager.prototype = managerMaker();
        ContainerManager.prototype.getContainer = getContainer;
        ContainerManager.prototype.getParentContainer = getParentContainer;
        ContainerManager.prototype.wrapElement = wrapElement;
        ContainerManager.prototype.create = createContainer;
        ContainerManager.prototype._getNewTrackId = getNewTrackId;
        ContainerManager.prototype._initPendingContainers = initPendingContainers;

        var manager = new ContainerManager();

        parser.events.afterParseAll.register("core.container.manager", function() {
            // TODO: Process tracked elements

            manager._initPendingContainers();
        });

        return manager;

        function createContainer(type, payload, parentScope) {
            var type = this.get(type);
            var trackId = this._getNewTrackId();
            var instance = new type(trackId, payload, parentScope);

            this.pendingContainers.push(instance);

            return this.containers[trackId] = instance;
        }

        function getContainer(element) {
            return element.$container || null;
        }

        function wrapElement(element, type, payload) {
             var parentContainer = this.getParentContainer(element);

             var container = this.create(type, payload);

             container.setParent(parentContainer);
             container.owner = element;
             element.$container = container;

             return container;
        }

        function initPendingContainers() {
            while(this.pendingContainers.length > 0) {
                var container = this.pendingContainers.shift();
                container.link();
            }
        }

        function getNewTrackId() {
            return this.trackId++;
        }

        function getParentContainer(element) {
            var elementContainer = this.getContainer(element);

            if (elementContainer) {
                return elementContainer.getParent();
            }

            var parent = element.parentElement;

            while(parent !== null) {
                var container = this.getContainer(parent);

                if (container) {
                    return container;
                }

                parent = parent.parentElement;
            }

            return null;
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);