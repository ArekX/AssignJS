(function(core) {
    "use strict";

    core.modules.define("core.container.manager", ContainerManagerModule);

    ContainerManagerModule.deps = ["core.parser", "core.manager.base", "core.event.group"];

    function ContainerManagerModule(parser, managerMaker, makeEventGroup) {
        function ContainerManager() {
            this._trackId = 1;
            this._processableContainers = [];
            this._pendingContainers = [];
        }

        ContainerManager.prototype = managerMaker();
        ContainerManager.prototype.getContainer = getContainer;
        ContainerManager.prototype.getParentContainer = getParentContainer;
        ContainerManager.prototype.wrapElement = wrapElement;
        ContainerManager.prototype.processDeleted = processDeleted;
        ContainerManager.prototype.create = createContainer;
        ContainerManager.prototype.processContainers = runProcessableContainers;
        ContainerManager.prototype._initPendingContainers = initPendingContainers;
        ContainerManager.prototype._getNewTrackId = getNewTrackId;

        var manager = new ContainerManager();

        parser.events.register('afterParseAll', function() {
            manager._initPendingContainers();
            manager.processContainers();
        });

        return manager;

        function createContainer(type) {
            var trackId = this._getNewTrackId();
            var instance = new (this.get(type))(trackId);

            this._pendingContainers.push(instance);
            
            if (instance.process) {
                this._processableContainers.push(instance);
            }

            return instance;
        }

        function processDeleted(elements) {
            for(var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var containerElements = parser.getParseableElements(element);

                for (var j = 0; j < containerElements.length; j++) {
                    unlinkContainer(this.getContainer(containerElements[j]));
                }

                unlinkContainer(this.getContainer(element));
            }

            function unlinkContainer(container) {
                if (!container || container.isUnlinked()) {
                    return;
                }

                container.unlink();
            }
        }

        function runProcessableContainers() {
            parser.begin();

            for(var i = 0; i < this._processableContainers.length; i++) {
                this._processableContainers[i].process();
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
            while(this._pendingContainers.length > 0) {
                var container = this._pendingContainers.shift();
                container.link();
            }
        }

        function getNewTrackId() {
            return this._trackId++;
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