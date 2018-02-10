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
            var container = containerManager.wrapElement(element, this.config.container);
            var parent = container.getParent();

            assert.notIdentical(parent, null, 'Parent must be defined.');

            var component = container.getParent().getPayload();
            var props = component.props;
            var deleted = true;

            container.setPayload(function(element) {
                var value = props.get(def.name, '');

                if (def.type === 'function' && vars.isFunction(value)) {
                    var funcProps = props.getMultiple(def.arguments, null);
                    var args = def.arguments.map(function(item) {
                        return funcProps[item];
                    });

                    value = value.apply(component, args);
                }

                html.setContents(element, value);
            });

            props.events.created.register(function(result) {
                if (isTrackedPropertyInResult(result)) {
                    deleted = false;
                }
            });

            props.events.deleted.register(function(result) {
                if (isTrackedPropertyInResult(result)) {
                    deleted = true;
                }
            });

            props.events.changed.register(function(result) {
                if (deleted) {
                    return;
                }

                if (isTrackedPropertyInResult(result)) {
                    container.invalidate();
                }
            });

            function isTrackedPropertyInResult(result) {
                return (result.type === 'single' && result.prop === def.name) || 
                       (result.type === 'multiple' && result.props.hasOwnProperty(def.name));
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);