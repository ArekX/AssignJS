// @import: core/lib.js

"use strict";

lib(function() {
    var coreName = scriptElement.dataset.nameAs || 'AssignJS';

    var runners = [];
    var core = this;

    core.config = {
        base: {
            nameRegex: /[a-zA-Z][a-zA-Z0-9_\.-]+/
        }
    };
    core.throwError = throwError;
    core.addRunner = addRunner;
    core.run = run;

    scriptElement.$main = window[coreName] = core;
    scriptElement.setAttribute('data-assign-js-core', coreName);

    return;

    function addRunner(runner) {
        runners.push(runner);
    }

    function run() {
        for(var i = 0; i < runners.length; i++) {
            runners[i].call(core);
        }
    }

});