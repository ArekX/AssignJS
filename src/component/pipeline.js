// @import: core

lib(['component', 'inspect', 'assert', 'object'], function ComponentPipeline(component, inspect, assert, object) {
    var ActionPipeline = {
        _branchedChild: null,
        _actions: null,
        _onceActions: null,
        _onceActionIndices: null,
        _beforeRunActions: null,
        _afterRunActions: null,
        parent: null,
        triggerBeforeRun: triggerBeforeRun,
        triggerAfterRun: triggerAfterRun,
        beforeRun: null,
        afterRun: null,
        init: init,
        push: push,
        afterRunOnce: afterRunOnce,
        beforeRunOnce: beforeRunOnce,
        shift: shift,
        run: run,
        branch: branch
    };

    var forksToRun = [];
    var beforeRunOnceCalls = [];
    var afterRunOnceCalls = [];
    var processId = null;

    var tickHandler = window.requestAnimationFrame ? animationFrameTick : timeoutTick;

    component.pipeline = {
        create: createPipeline
    };

    component.pipeline.root = createPipeline();

    return;

    function timeoutTick() {
        clearTimeout(processId);
        processId = setTimeout(runForkList, 0);
    }

    function pushForkToList(fork) {
        var forkIndex = forksToRun.indexOf(fork);

        if (forkIndex !== -1) {
            forksToRun.push(forksToRun.splice(forkIndex, 1)[0]);
        } else {
            forksToRun.push(fork);
        }
    }

    function runForkList() {
        while(forksToRun.length > 0) {
            forksToRun.shift().run();
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
        this.parent = parentFork;
    }

    function beforeRunOnce(callback) {
        if (!this._beforeRunActions) {
            this._beforeRunActions = [];
        }

        if (this._beforeRunActions.indexOf(callback) === -1) {
            this._beforeRunActions.push(callback);
        }
    }

    function afterRunOnce(callback) {
      if (!this._afterRunActions) {
          this._afterRunActions = [];
      }

      if (this._afterRunActions.indexOf(callback) === -1) {
          this._afterRunActions.push(callback);
      }
    }

    function branch() {
        return component.pipeline.create(this);
    }

    function push(action, onAllDone, once) {
        tickHandler();
        this._actions.push(makeActionObject(this, action, onAllDone, once));
        pushForkToList(this);
    }

    function shift(action, onAllDone) {
      tickHandler();
      this._actions.shift(makeActionObject(this, action, onAllDone, once));
      pushForkToList(this);
    }

    function makeActionObject(pipeline, action, onAllDone, once) {
      if (!once) {
          return {
              action: action,
              onAllDone: onAllDone
          };
      }

      var actionIndex = pipeline._onceActions.indexOf(action);
      var actionObject = null;

      if (actionIndex !== -1) {
          actionObject = pipeline._onceActionObjects[actionIndex];
          pipeline._actions.splice(pipeline._actions.indexOf(actionObject), 1);
      } else {
          actionIndex = pipeline._onceActions.length;
          actionObject = {
              onceIndex: actionIndex,
              action: action,
              onAllDone: onAllDone
          };

          pipeline._onceActions.push(action);
          pipeline._onceActionObjects.push(actionObject);
      }

      return actionObject;
    }

    function triggerBeforeRun() {
       this.parent && this.parent.triggerBeforeRun();
       this.beforeRun && this.beforeRun();

       if (this._beforeRunActions) {
         while(this._beforeRunActions.length > 0) {
             (this._beforeRunActions.pop())();
         }
       }
    }

    function triggerAfterRun() {
        this.afterRun && this.afterRun();

        if (this._afterRunActions) {
          while(this._afterRunActions.length > 0) {
              (this._afterRunActions.pop())();
          }
        }

        this.parent && this.parent.triggerAfterRun();
    }

    function run() {
        var actions = this._actions;

        this.triggerBeforeRun();

        if (actions.length == 0) {
            this.triggerAfterRun();
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

            this.triggerAfterRun();

        } catch (e) {
            this._actions = [];
            this._onceActions = [];
            this._onceActionObjects = [];

            throw e;
        }
    }
});
