// @import: core

lib(['compiler', 'inspect', 'assert', 'object'], function CompilerPipeline(compiler, inspect, assert, object) {
    var ActionPipeline = {
        _branchedChild: null,
        _actions: null,
        _onceActions: null,
        _onceActionIndices: null,
        _parent: null,
        _pushAfterRunOnce: pushAfterRunOnce,
        _pushBeforeRunOnce: pushBeforeRunOnce,
        _pushAction: pushAction,
        triggerBeforeRun: triggerBeforeRun,
        triggerAfterRun: triggerAfterRun,
        afterRunAlways: null,
        afterRunOnce: null,
        beforeRunAlways: null,
        beforeRunOnce: null,
        init: init,
        pushOnce: pushOnce,
        push: push,
        run: run,
        branch: branch
    };

    var forksToRun = [];
    var beforeRunOnceCalls = [];
    var afterRunOnceCalls = [];
    var processId = null;

    var tickHandler = window.requestAnimationFrame ? animationFrameTick : timeoutTick;

    compiler.pipeline = {
        create: createPipeline
    };

    compiler.pipeline.root = createPipeline();

    return;

    function timeoutTick() {
        clearTimeout(processId);
        processId = setTimeout(runForkList, 0);
    }

    function pushForkToList(fork) {
        var forkIndex = forksToRun.indexOf(fork);

        if (forkIndex !== -1) {
            forksToRun.splice(forkIndex, 1);
        }

        forksToRun.push(fork);
    }

    function runForkList() {
        var beforeFunctions = [];
        var afterFunctions = [];

        while(forksToRun.length > 0) {
           var fork = forksToRun.pop();
           fork.triggerBeforeRun();

           runTriggers(beforeRunOnceCalls, beforeFunctions);

           fork.run();

           fork.triggerAfterRun();
           runTriggers(afterRunOnceCalls, afterFunctions);
        }
    }

    function runTriggers(handlers, checker) {
        while(handlers.length > 0) {
           var func = handlers.pop();
           if (checker.indexOf(func) === -1) {
               func();
               checker.push(func);
           }
        }
    }

    function animationFrameTick() {
        window.cancelAnimationFrame(processId);
        processId = window.requestAnimationFrame(runForkList);
    }

    function createPipeline(parent) {
        return object.create(ActionPipeline, [parent]);
    }

    function init(parentFork) {
        this._actions = [];
        this._onceActions = [];
        this._onceActionObjects = [];
        this._parent = parentFork;
    }

    function branch() {
        if (this._branchedChild) {
            return this._branchedChild;
        }
        return this._branchedChild = compiler.pipeline.create(this);
    }

    function push(action, onAllDone) {
          this._pushAction({
              action: action,
              onAllDone: onAllDone
          });
    }

    function pushOnce(action, onAllDone) {
        var actionIndex = this._onceActions.indexOf(action);
        var actionObject = null;

        if (actionIndex !== -1) {
            actionObject = this._onceActionObjects[actionIndex];
            this._actions.splice(this._actions.indexOf(actionObject), 1);
        } else {
            actionIndex = this._onceActions.length;
            actionObject = {
                onceIndex: actionIndex,
                action: action,
                onAllDone: onAllDone
            };

            this._onceActions.push(action);
            this._onceActionObjects.push(actionObject);
        }

        this._pushAction(actionObject);
    }

    function pushAction(actionObject) {
        tickHandler();
        this._actions.push(actionObject);
        pushForkToList(this);
    }

    function pushAfterRunOnce() {
        if (this.afterRunOnce && afterRunOnceCalls.indexOf(this.afterRunOnce) === -1) {
            afterRunOnceCalls.push(this.afterRunOnce);
        }
    }

    function pushBeforeRunOnce() {
      if (this.beforeRunOnce && beforeRunOnceCalls.indexOf(this.beforeRunOnce) === -1) {
          beforeRunOnceCalls.push(this.beforeRunOnce);
      }
    }

    function triggerBeforeRun() {
        this._parent && this._parent.triggerBeforeRun();
        this.beforeRunAlways && this.beforeRunAlways();
        this._pushBeforeRunOnce();
    }

    function triggerAfterRun() {
        this._parent && this._parent.run();

        this.afterRunAlways && this.afterRunAlways();
        this._pushAfterRunOnce();
        this._parent && this._parent.triggerAfterRun();
    }

    function run() {
        var actions = this._actions;

        if (actions.length == 0) {
            return;
        }

        try {
            var allDone = [];

            while(actions.length > 0) {
                var action = actions.shift();

                if (action.onceIndex) {
                    this._onceActions[action.onceIndex] = null;
                    this._onceActionObjects[action.onceIndex] = null;
                }

                action.action();
                action.onAllDone && allDone.push(action.onAllDone);
            }

            for (var i = 0; i < allDone.length; i++) {
                allDone[i]();
            }

            this._onceActions = [];
            this._onceActionObjects = [];

        } catch (e) {
            this._actions = [];
            this._onceActions = [];
            this._onceActionObjects = [];

            throw e;
        }
    }
});
