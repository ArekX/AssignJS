// @import: core
// @import: compiler

"use strict";

lib(['createFactory'], function(createFactory) {
    var rootContainer = null;

    var factory = createFactory();

    this.container = {
        factory: factory,
        wrap: wrapElement,
        getContainer: getElementContainer,
        findParentContainer: findParentContainer,
        getRootContainer: getRootContainer
    };

    return;

    function wrapElement(element, containerType) {
        var elementContainer = getElementContainer(element);

        if (elementContainer) {
            return elementContainer;
        }

        var parent = findParentContainer(element);
        var container = factory.create(containerType, [element, parent]);
        return container;
    }

    function getElementContainer(element) {
        return element.$container;
    }

    function findParentContainer(element) {
        var elementContainer = getElementContainer(element);

        if (elementContainer) {
            return elementContainer.getParent();
        }

        var parent = element.parentElement;

        while(parent !== null) {
            var container = getElementContainer(parent);

            if (container) {
                return container;
            }

            parent = parent.parentElement;
        }

        return getRootContainer();
    }

    function getRootContainer() {
        if (rootContainer === null) {
            rootContainer = factory.createDefault([document, null]);
        }

        return rootContainer;
    }
});