// @import: throwError.js

lib(function() {
    var core = this;

    var runners = [];

    core.config = {
        assignParam: '$assign'
    };

    core.throwError = throwError;
    core.addRunner = addRunner;
    core.run = run;

    return;

    function addRunner(runner) {
        runners.push(runner);
    }

    function run(config) {
        for(var i = 0; i < runners.length; i++) {
            runners[i].call(core, config);
        }
    }

});
