// @import: core

"use strict";

lib(['assert', 'vars', 'createFactory'], function(assert, vars, createFactory) {
    this.events = {
        factory: createFactory()
    };
});