(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ComponentRenderProperty);

    ComponentRenderProperty.deps = ["core.parser", "core.manager.base", "core.container.manager"];

    function ComponentRenderProperty(parser, makeManager, containerManager) {
        var module = this.module;
        var assert = core.assert;
        var vars = core.vars;
        var html = core.html;
        var regex = /^(\@|\#)([^()\ ]+)(\(.*?\))?(\s*\-\>\s*([a-zA-Z0-9]+)(\:([_a-zA-Z0-9]+))?)?$/;
        var argumentsRegex = /^\((.*?)\)$/;
        var CHECK_SWITCH = 'checkSwitch';
        var allowedTypes = [
            html.contentTypes.INTO_HTML,
            html.contentTypes.INTO_VALUE,
            CHECK_SWITCH
        ];

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

            assert.identical(parts.length, 9, "Cannot parse tracked property. Invalid syntax.", {
                line: line,
                parts: parts
            });

            var name = parts[2];
            var isTwoWay = parts[1] == '#'; 

            var type = parts[3] ? 'function' : 'property';
            var args = [];

            if (type === 'function') {
                args = parts[3].split(argumentsRegex)[1].split(",").map(function(item) {
                    return item.trim();
                }).filter(function(item) {
                    return item.length > 0;
                });
            }

            // TODO: But they can be Property function
            assert.isFalse(isTwoWay && type === 'function', 'Two way databound properties cannot be functions.', {
                type: type,
                name: name
            });

            if (!isTwoWay) {
                assert.isTrue(!parts[7], 'One way databound properties cannot have events.', {
                    type: type,
                    name: name
                });
            }
            

            var setInto = html.isInputElement(element) ? 'value' : 'html';

            if (parts[5] && allowedTypes.indexOf(parts[5]) !== -1) {
                setInto = parts[5];
            }

            var bindEvent = parts[7] ? parts[7] : 'input';

            return {
                twoWay: isTwoWay,
                type: type,
                name: name,
                arguments: args,
                setInto: setInto,
                bindEvent: bindEvent
            };
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

            if (def.twoWay && html.isInputElement(element)) {
                element.addEventListener(def.bindEvent, function() {

                     if (def.setInto === CHECK_SWITCH && element.type === "checkbox") {
                        if (!element.checked) {
                            props.set(def.name, "");
                            return;
                        }
                     }

                     props.set(def.name, element.value);
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
                var value = props.get(def.name, '');

                if (isFunction && vars.isFunction(value)) {
                    var funcProps = props.getMultiple(def.arguments, null);
                    var args = def.arguments.map(function(item) {
                        return funcProps[item];
                    });


                    value = value.apply(props.owner, args);
                }

                if (def.setInto === CHECK_SWITCH) {
                    element.checked = element.value === value;
                } else {
                    container.setContents(value, def.setInto);
                }
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);