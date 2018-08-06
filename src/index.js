"use strict";

// @import: lib.js

// @import: core
// @import: compiler
// @import: io
// @import: component

// @import: instance.js

var coreName = scriptElement.dataset.nameAs || 'AssignJS';
var originalImplementors = ([]).concat(implementors);

scriptElement.$main = window[coreName] = {
    create: makeNewInstance,
    lib: lib
};

scriptElement.setAttribute('data-assign-js', coreName);
