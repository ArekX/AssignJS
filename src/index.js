(function(script) {
    "use strict";
    
    var coreName = script.dataset.nameAs || 'AssignJS';
    var runners = [];

    function AssignJS() {}

    AssignJS.prototype.throwError = throwError;
    AssignJS.prototype.addRunnable = addRunnable;
    AssignJS.prototype.run = run;
    
    script.setAttribute('data-assign-js-core', coreName);
    return window[coreName] = script.$main = new AssignJS();

    function isNamespaceValid(namespace) {
        return namespace.match(namespaceRegex) !== null;
    }

    function throwError(message, data) {
        var object = {message: message};
        data = data || {};

        for(var item in data) {
            if (!data.hasOwnProperty(item)) {
                continue;
            }

            object[item] = data[item];
        }

        object.toString = function() {
            return message;
        };

        throw object;
    }

    function addRunnable(runner) {
        runners.push(runner);
    }

    function run() {
        for(var i = 0; i < runners.length; i++) {
            runners[i]();
        }
    }

})(document.body.querySelector('script:last-child'));