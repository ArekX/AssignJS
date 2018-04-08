// @import: core
// @import: container/base.js
// @import: container/scope.js

"use strict";

lib(['container', 'assert', 'events'], function(container, assert, events) {

    var trackId = 1;

    var BaseContainer = {
        _scope: null,
        _trackId: null,
        init: initialize,
        setParent: setParent,
        removeParent: removeParent,
    };

    container.factory.add('base', BaseContainer);
    container.factory.setDefaultType('base');

    return;

    function initialize(element, parent) {
        this._trackId = trackId++;
        this.owner = element;
        this._parent = null;

        if (parent) {
            this.setParent(parent);
        }

        element.$container = this;

        this.events = events.createGroup([
            'onConnect',
            'onDestroy'
        ], this);
    }

    function setParent(container) {
        if (this._parent) {
            this.removeParent();
        }

        // TODO: set callbacks, etc...
    }

    function removeParent() {
        if (this._parent === null) {
            return;
        }

        // TODO: unset callbacks, etc...
    }
});