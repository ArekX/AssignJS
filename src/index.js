"use strict";

// @import: lib.js

// @import: core
// @import: events
// @import: renderer
// @import: compiler
// @import: io
// @import: component

var coreName = scriptElement.dataset.nameAs || 'AssignJS';

scriptElement.$main = window[coreName] = {
    create: makeNewInstance,
    lib: lib
};

scriptElement.setAttribute('data-assign-js', coreName);