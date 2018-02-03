(function(core) {
    core.modules.define("core.container.manager", ContainerManagerModule);

    ContainerManagerModule.deps = ["core.parser", "core.manager.base"];

    function ContainerManagerModule(parser, managerMaker) {
        parser.events.afterParseAll.register("core.container.manager", function() {
            // TODO: Process tracked elements
        });

        function ContainerManager() {
            this.trackId = 1;
            this.containers = {};
        }

        ContainerManager.prototype = managerMaker();
        ContainerManager.prototype.getContainer = getContainer;
        ContainerManager.prototype.getParentContainer = getParentContainer;
        ContainerManager.prototype.wrapElement = wrapElement;
        ContainerManager.prototype.create = createContainer;
        ContainerManager.prototype._getNewTrackId = getNewTrackId;

        return new ContainerManager();

        function createContainer(type, payload, parentScope) {
            var type = this.get(type);
            var trackId = this._getNewTrackId();
            var instance = new type(trackId, payload, parentScope);

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

             return container;
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
                var container = this.getContainer(element);

                if (container) {
                    return container;
                }

                parent = parent.parentElement;
            }

            return null;
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);