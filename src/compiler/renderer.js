// @import: core

lib(['events', 'compiler', 'inspect'], function CompilerRenderer(events, compiler, inspect) {
    var actions = [];
    var processId = null;

    var tickHandler = window.requestAnimationFrame ? animationFrameTick : timeoutTick;

    var renderer = compiler.renderer = {
        render: render,
        run: run,
        push: pushAction
    };

    var parser = compiler.parser;

    renderer.events = events.createGroup([
        'afterRun'
    ], renderer);

    return;

    function pushAction(action, onAllDone) {
        tickHandler();

        if (action) {
            actions.push({
                action: action, 
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
            var allDone = [];

            while(actions.length > 0) {
                var action = actions.shift();
                action.action();
                action.onAllDone && allDone.push(action.onAllDone);
            }

            for (var i = 0; i < allDone.length; i++) {
                allDone[i]();
            }

            // renderer.events.trigger('afterRun');
        } catch (e) {
            actions = [];
            throw e;
        }
    }

    function render(element, contents, onAllDone) {
        var ob = inspect.getElementObject(element);

        if (!ob.io.output.shouldWrite(contents)) {
            onAllDone && onAllDone();
            return;
        }

        this.push(performRender, onAllDone);

        function performRender() {
            ob.io.output.write(contents);
            parser.parseAll(element);
        }
    }

    
});