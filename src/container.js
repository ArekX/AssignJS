(function(core) {
    "use strict";

    core.modules.define("core.container.manager", ContainerManagerModule);

    ContainerManagerModule.deps = ["core.parser", "core.manager.base", "core.event"];

    function ContainerManagerModule(parser, managerMaker, makeEventEmitter) {
        function ContainerManager() {
            this.trackId = 1;
            this.containers = {};
            this.processableContainers = [];
            this.pendingContainers = [];
            this.events = {
                afterInitPending: makeEventEmitter(this)
            };
        }

        ContainerManager.prototype = managerMaker();
        ContainerManager.prototype.getContainer = getContainer;
        ContainerManager.prototype.getParentContainer = getParentContainer;
        ContainerManager.prototype.wrapElement = wrapElement;
        ContainerManager.prototype.create = createContainer;
        ContainerManager.prototype._getNewTrackId = getNewTrackId;
        ContainerManager.prototype._initPendingContainers = initPendingContainers;
        ContainerManager.prototype.processContainers = runProcessableContainers;

        var manager = new ContainerManager();

        parser.events.afterParseAll.register("core.container.manager", function() {
            manager._initPendingContainers();
            manager.processContainers();
        });

        return manager;

        function createContainer(type) {
            var trackId = this._getNewTrackId();
            var instance = new (this.get(type))(trackId);

            this.pendingContainers.push(instance);
            
            if (instance.process) {
                this.processableContainers.push(instance);
            }

            return this.containers[trackId] = instance;
        }

        function runProcessableContainers() {
            parser.begin();

            for(var i = 0; i < this.processableContainers.length; i++) {
                this.processableContainers[i].process();
            }   
            
            parser.end();
        }

        function getContainer(element) {
            return element.$container || null;
        }

        function wrapElement(element, type) {
             var parentContainer = this.getParentContainer(element);

             var container = this.create(type);

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