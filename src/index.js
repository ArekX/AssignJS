"use strict";

// @import: lib.js

// @import: core
// @import: events
// @import: compiler

var coreName = scriptElement.dataset.nameAs || 'AssignJS';

scriptElement.$main = window[coreName] = makeNewInstance();
window[coreName].newInstance = makeNewInstance;

scriptElement.setAttribute('data-assign-js-core', coreName);