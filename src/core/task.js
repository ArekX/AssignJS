lib(function() {
    var beforeOnceCalls = [];
    var afterOnceCalls = [];
    var actions = [];
    var processId = null;

    var tickHandler = window.requestAnimationFrame ? animationFrameTick : timeoutTick;

    this.task = {
          push: push,
          unshift: unshift,
          afterRunOnce: afterRunOnce,
          beforeRunOnce: beforeRunOnce
    };

    return;

    function timeoutTick() {
        clearTimeout(processId);
        processId = setTimeout(run, 0);
    }

    function animationFrameTick() {
        window.cancelAnimationFrame(processId);
        processId = window.requestAnimationFrame(run);
    }

    function beforeRunOnce(callback) {
        (beforeOnceCalls.indexOf(callback) === -1) && beforeOnceCalls.push(callback);
    }

    function afterRunOnce(callback) {
        (afterOnceCalls.indexOf(callback) === -1) && afterOnceCalls.push(callback);
    }

    function push(action, once) {
        tickHandler();
        once && removeOldAction(action);
        actions.push(action);
    }

    function unshift(action, once) {
       tickHandler();
       once && removeOldAction(action);
       actions.unshift(action);
    }

    function removeOldAction(action) {
        var currentIndex = actions.indexOf(action);

        if (currentIndex !== -1) {
            actions.splice(currentIndex, 1);
        }
    }

    function run() {
        try {
            while(beforeOnceCalls.length) {
                (beforeOnceCalls.shift())();
            }

            if (actions.length == 0) {
                return;
            }

            while(actions.length) {
                (actions.pop())();
            }

            while(afterOnceCalls.length) {
                (afterOnceCalls.pop())();
            }

        } catch (e) {
            actions = [];
            beforeRunOnceCalls = [];
            afterRunOnceCalls = [];

            throw e;
        }
    }
});
