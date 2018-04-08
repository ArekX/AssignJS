// @import: core

"use strict";

lib(['html'], function(html) {
    
    var actions = [];
    var resolveTimeout = null;

    this.renderer = {
        renderContents: renderContents,
        render: renderActions,
        push: pushAction
    };

    return;

    function renderContents(element, contents, onAllDone, onDone) {
        this.push(function() {
            html.setContents(element, contents);
        }, onAllDone, onDone);
    }

    function pushAction(action, onAllDone, onDone) {
        if (action) {
            actions.push([action, onActionDone, onAllDone]);
        }

        clearTimeout(resolveTimeout);
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

            for(var i = 0; i < actions.length; i++) {
                var action = actions[i][0];
                var onDone = actions[i][1];
                action();
                onDone && onDone();
            }

            for(var i = 0; i < actions.length; i++) {
                var onAllDone = actions[i][2];
                onAllDone && onAllDone();
            }

            actions = [];          
        }
    }
});