(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ComponentRenderProperty);

    ComponentRenderProperty.deps = ["core.parser", "core.manager.base", "core.container.manager"];

    function ComponentRenderProperty(parser, makeManager, containerManager) {
        var module = this.module;
        var assert = core.assert;
        var vars = core.vars;
        var html = core.html;
        var regex =  /^\@([^()\ ]+)(\(.*?\))?$/;
        var argumentsRegex = /^\((.*?)\)$/;

        function PropertyManager() {
            this.config = {
                container: "core.rendered"
            };
        }

        PropertyManager.prototype = core.vars.extendPrototype(makeManager(), {
            parseStringDef: parseStringDef,
            trackProperty: trackProperty
        });

        var manager = new PropertyManager();

        parser.define("core.component.property", regex, manager.trackProperty.bind(manager));

        return manager;

        function parseStringDef(line) {
            var parts = line.split(regex);

            assert.identical(parts.length, 4, "Cannot parse tracked property. Invalid syntax.", {
                line: line,
                parts: parts
            });

            var type = parts[2] ? 'function' : 'property';
            var args = [];

            if (type === 'function') {
                args = parts[2].split(argumentsRegex)[1].split(",").map(function(item) {
                    return item.trim();
                }).filter(function(item) {
                    return item.length > 0;
                });
            }

            return {
                type: type,
                name: parts[1],
                arguments: args
            };
        }

        function trackProperty(line, element) {
            var def = this.parseStringDef(line);
            var isListening = true;
            var isFunction = def.type === 'function';

            var container = containerManager.wrapElement(element, this.config.container);
            var parent = container.getParent();
            var oldScope = container.scope;

            container.scope = parent.scope;

            assert.notIdentical(parent, null, 'Parent must be defined.');

            var props = parent.getPayload().props;

            container.setPayload(render);
            render.props = props;

            props.events.created.register(handleCreated);
            props.events.deleted.register(handleDeleted);
            props.events.changed.register(handleChanged);

            parent.registerEvent('beforeUnlink', function() {
                container.unlink();
            });

            container.registerEvent('beforeUnlink', function() {
                container.scope = oldScope;
                props.events.created.unregister(handleCreated);
                props.events.deleted.unregister(handleDeleted);
            });

            function handleCreated(result) {
                if (isTrackedPropertyInResult(result) && !isListening) {
                    props.events.changed.register(handleChanged);
                    isListening = true;
                }
            }

            function handleDeleted(result) {
                 if (isTrackedPropertyInResult(result)) {
                    props.events.changed.unregister(handleChanged);
                    isListening = false;
                }
            }

            function handleChanged(result) {
                if (!isListening) {
                    return;
                }

                if (isFunction || isTrackedPropertyInResult(result)) {
                    container.invalidate();
                }
            }

            function isTrackedPropertyInResult(result) {
                switch(result.type) {
                    case 'single':
                        return result.prop === def.name;
                    case 'multiple':
                        return result.props.hasOwnProperty(def.name);
                }

                return false;
            }

            function render(element) {
                var value = props.get(def.name, '');

                if (isFunction && vars.isFunction(value)) {
                    var funcProps = props.getMultiple(def.arguments, null);
                    var args = def.arguments.map(function(item) {
                        return funcProps[item];
                    });


                    value = value.apply(props.owner, args);
                }

                container.setContents(value);
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);