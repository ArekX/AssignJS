// @import: compiler/base.js

lib(['compiler', 'html', 'inspect'], function (compiler, html, inspect) {

    var actions = [];
    var resolveTimeout = null;

    compiler.renderer = {
        renderContents: renderContents,
        run: renderActions,
        push: pushAction
    };

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
                
                actions = [];
            } catch (e) {
                actions = [];
                throw e;
            }
        }
    }

    function renderContents(element, contents, onAllDone, onDone) {
        var ob = inspect.getCompiledObject(element);

        if (ob === null) {
            return;
        }

        if (!ob.newContents) {
            ob.newContents = null;
        }

        if (ob.newContents === contents) {
            return;
        }

        if (inspect.isElementList(contents) && inspect.isElementParent(contents, element)) {
            return;
        }

        /*
            Changes:
            1. Rendering, and inspecting needs to be placed on the element. We need to have following things:
               shouldRender(contents), render(contents). This function will only call that.
               - We will have multiple renderer classes:
                    1. propertyFromAppNesto - property from props parent, if prop doesnt exist, undefined will be returned.
                    2. [attribute] - attribute from the OWNER element, if it doesn't exist, undefined will be returned.
                    3. %meta - attribute from the object from the OWNER element, if it doesn't exist, undefined will be returned.
                    4. _ - void, do not read or write to this. Passing this to a function will be an undefined value.
                    5. (Literal) - Pass literal to a function. Literal is a JSON parseable string which must be defined. () will be an error.
                    6. $name - Pass value from the parent scope, if name is not in scope, undefined will be returned.
                    7. ~name - Pass payload from container from the parent scope, if not a container undefined will be returned.
                    For: @ default input:output -> _:%innerHTML
                    For: # default input:output -> _:_

                    @# are bind types - (two-way, one-way)

                    We will do this by making an IO folder. So Multiple IO's (factory) each will take:
                        constructor(config), write(value), read(), isReadOnly(), isWriteOnly()

                    IO will have a base class io.resolve(string): Resolver, io.addHandler(regex, handler)

            2. We need to figure out how we will not have 300 renders. If something is going to get overwritten later,
               ignore the previous op (renderer needs to specify this since there can be appending renderers).
               Maybe we remove the previous render and append the action after?
        */

        ob.newContents = contents;
        this.push(performRender, onAllDone, onDone);

        function performRender() {
            if (inspect.isElement(contents)) {
                 element.innerHTML = '';
                 element.appendChild(contents);
                 return;
            }

            var isString = inspect.isString(contents);

            if (!isString && inspect.isIterable(contents)) {
                ob.newContents = [];
                element.innerHTML = '';

                for(var i = 0; i < contents.length; i++) {
                    element.appendChild(contents[i]);
                    ob.newContents.push(contents[i]);
                }
            }

            if (isString) {
                contents = html.encode(contents);
            }

            element.innerHTML = contents;
        }
    }
});