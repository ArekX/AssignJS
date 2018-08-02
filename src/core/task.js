lib(function CoreTask() {
    var beforeOnceCalls = [];
    var afterOnceCalls = [];
    var onceActions = [];
    var onceActionObjects = [];
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

    function push(action, onAllDone, once) {
        tickHandler();
        actions.push(makeActionObject(action, onAllDone, once));
    }

    function unshift(action, onAllDone) {
       tickHandler();
       actions.unshift(makeActionObject(action, onAllDone, once));
    }

    function makeActionObject(action, onAllDone, once) {
      if (!once) {
          return {
              action: action,
              onAllDone: onAllDone
          };
      }

      var actionIndex = onceActions.indexOf(action);
      var actionObject = null;

      if (actionIndex !== -1) {
          actionObject = onceActionObjects[actionIndex];
      } else {
          actionIndex = onceActions.length;
          actionObject = {
              onceIndex: actionIndex,
              action: action,
              onAllDone: onAllDone
          };
      }

      return actionObject;
    }

    function run() {
        try {
            while(beforeOnceCalls.length) {
                (beforeOnceCalls.shift())();
            }

            if (actions.length == 0) {
                return;
            }

            var allDone = [];

            while(actions.length) {
                var action = actions.pop();

                if (action.onceIndex) {
                    onceActions[action.onceIndex] = null;
                    onceActionObjects[action.onceIndex] = null;
                }

                action.action();
                action.onAllDone && allDone.push(action.onAllDone);
            }

            for (var i = 0; i < allDone.length; i++) {
                allDone[i]();
            }

            onceActions = [];
            onceActionObjects = [];

            while(afterOnceCalls.length) {
                (afterOnceCalls.pop())();
            }

        } catch (e) {
            onceActions = [];
            onceActionObjects = [];
            actions = [];
            beforeRunOnceCalls = [];
            afterRunOnceCalls = [];

            throw e;
        }
    }
});
