// @import: core

lib(['config', 'events'], 
    function RendererBase(configManager, events) {

    var actions = [];
    var resolveTimeout = null;

    var config = configManager.renderer = {
        renderType: 'html'
    };

    var renderer = this.renderer = {
        types: {},
        render: render,
        run: renderActions,
        push: pushAction
    };

    renderer.events = events.createGroup([
        'afterRun'
    ], renderer);

    return;

    function pushAction(action, onAllDone, onDone) {
        clearTimeout(resolveTimeout);

        if (action) {
            actions.push([action, onDone, onAllDone]);
        }

        resolveTimeout = setTimeout(renderActions, 0);
    }

    function renderActions() {
        clearTimeout(resolveTimeout);

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(processActions);
        } else {
            processActions();
        }

        function processActions() {
            if (actions.length == 0) {
                return;
            }

            try {
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i][0];
                    var onDone = actions[i][1];
                    action();
                    onDone && onDone();
                }

                for (var i = 0; i < actions.length; i++) {
                    var onAllDone = actions[i][2];
                    onAllDone && onAllDone();
                }

                renderer.events.trigger('afterRun');
                
                actions = [];
            } catch (e) {
                actions = [];
                throw e;
            }
        }
    }

    function render(element, contents, onAllDone, onDone) {
        this.types[config.renderType](element, contents, onAllDone, onDone);
    }
});