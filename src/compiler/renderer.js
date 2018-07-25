// @import: core

lib(['events', 'compiler'], function CompilerRenderer(events, compiler) {
    var actions = [];
    var processId = null;

    var tickHandler = window.requestAnimationFrame ? animationFrameTick : timeoutTick;

    var renderer = compiler.renderer = {
        render: render,
        run: run,
        push: pushAction
    };

    renderer.events = events.createGroup([
        'afterRun'
    ], renderer);

    return;

    function pushAction(action, onAllDone, onDone) {
        tickHandler();

        if (action) {
            actions.push({
                action: action, 
                onDone: onDone, 
                onAllDone: onAllDone
            });
        }
    }

    function timeoutTick() {
        clearTimeout(processId);
        processId = setTimeout(run, 0);
    }

    function animationFrameTick() {
        window.cancelAnimationFrame(processId);
        processId = window.requestAnimationFrame(run);
    }

    function run() {
        if (actions.length == 0) {
            return;
        }

        try {
            for (var i = 0; i < actions.length; i++) {
                actions[i].action();
                actions[i].onDone && actions[i].onDone();
            }

            for (var i = 0; i < actions.length; i++) {
                actions[i].onAllDone && actions[i].onAllDone();
            }

            renderer.events.trigger('afterRun');
            
            actions = [];
        } catch (e) {
            actions = [];
            throw e;
        }
    }

    function render(element, contents, onAllDone, onDone) {
        var ob = inspect.getElementObject(element);

        if (!ob.io.shouldWrite(contents)) {
            return;
        }

        this.push(performRender, onAllDone, onDone);

        function performRender() {
            ob.io.write(contents);
        }
    }

    
});