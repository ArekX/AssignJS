(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ComponentBindProperty);

    ComponentBindProperty.deps = ["core.parser", "core.manager.base", "core.container.manager"];

    function ComponentBindProperty(parser, makeManager, containerManager) {
        var module = this.module;
        var assert = core.assert;
        var vars = core.vars;
        var html = core.html;
        var regex = /^([_a-zA-Z0-9]*)(\@|\#)([^()\ ]+)(\(.*?\))?(\s+\-\>\s+([a-zA-Z0-9]+|\[[a-zA-Z0-9-]*\]|\$)?(\:([a-zA-Z0-9]+|\[[a-zA-Z0-9-]*\]|\$))?)?$/;
        var argumentsRegex = /^\((.*?)\)$/;
        var CHECK_SWITCH = 'checked';

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

        function parseStringDef(line, element) {
            var parts = line.split(regex);

            assert.identical(parts.length, 10, "Cannot parse tracked property. Invalid syntax.", {
                line: line,
                parts: parts
            });

            var config = {
                trackType: parts[2] === '@' ? 'property' : 'event',
                bindEvent: parts[1] || null,
                name: parts[3],
                readFrom: null,
                writeTo: null
            };

            var functionArgs = parts[4];

            config.type = functionArgs ? 'function' : 'property';
            var args = [];

            if (config.type === 'function') {
                args = parts[4].split(argumentsRegex)[1].split(",").map(function(item) {
                    return item.trim();
                }).filter(function(item) {
                    return item.length > 0;
                });
            }

            config.arguments = args;

            if (parts[6]) {
                config.readFrom = parts[6];
            }

            if (parts[8]) {
                config.writeTo = parts[8];
            }

            if (config.readFrom === null) {
                if (config.trackType === "event") {
                    config.readFrom = "[]";
                } else {
                    config.readFrom = html.isInputElement(element) ? 'value' : 'html';
                }
            }

            if (config.writeTo === null) {
                if (config.trackType === "event") {
                    config.writeTo = "$";
                } else {
                    config.writeTo = html.isInputElement(element) ? 'value' : 'html';
                }
            }

            return config;
        }

        function trackProperty(line, element) {
            var def = this.parseStringDef(line, element);

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

            props.events.register('created', handleCreated);
            props.events.register('deleted', handleDeleted);
            props.events.register('changed', handleChanged);

            parent.events.register('beforeUnlink', function() {
                container.unlink();
            });

            container.events.register('beforeUnlink', function() {
                container.scope = oldScope;
                props.events.unregister('created', handleCreated);
                props.events.unregister('deleted', handleDeleted);
            });

            if (def.bindEvent) {
                element.addEventListener(def.bindEvent, function(event) {
                     if (def.readFrom === '$') {
                        return;
                     }

                     if (def.readFrom === CHECK_SWITCH && element.type === "checkbox") {
                        if (!element.checked) {
                            props.set(def.name, "");
                            return;
                        }
                     }

                     var valueContents = html.getContents(element, def.readFrom);

                     if (isFunction) {
                        var value = props.get(def.name, '');
                        if (vars.isFunction(value)) {
                            value.apply(props.owner, [event, valueContents].concat(getFunctionProps()));
                        }
                        return;
                     }

                     if (def.readFrom !== '[]') {
                        props.set(def.name, valueContents);
                     }
                });
            }

            function handleCreated(result) {
                if (isTrackedPropertyInResult(result) && !isListening) {
                    props.events.register('changed', handleChanged);
                    isListening = true;
                }
            }

            function handleDeleted(result) {
                 if (isTrackedPropertyInResult(result)) {
                    props.events.unregister('changed', handleChanged);
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
                if (def.writeTo === '$') {
                    return;
                }

                var value = props.get(def.name, '');

                if (isFunction && vars.isFunction(value)) {
                    value = value.apply(props.owner, getFunctionProps());
                }

                if (def.writeTo === '[]') {
                    return;
                }

                if (def.writeTo === CHECK_SWITCH) {
                    element.checked = element.value === value;
                } else {
                    container.setContents(value, def.writeTo);    
                }
            }

            function getFunctionProps() {
                var funcProps = props.getMultiple(def.arguments, null);
                return def.arguments.map(function(item) {
                    return funcProps[item];
                });
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);