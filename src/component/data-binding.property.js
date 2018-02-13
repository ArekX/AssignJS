(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ComponentRenderProperty);

    ComponentRenderProperty.deps = ["core.parser", "core.manager.base", "core.container.manager"];

    function ComponentRenderProperty(parser, makeManager, containerManager) {
        var module = this.module;
        var assert = core.assert;
        var vars = core.vars;
        var html = core.html;
        var regex =  /^\#([^()\ \.]+)$/;

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

        parser.define("core.component.data.bound.property", regex, manager.trackProperty.bind(manager));

        return manager;

        function parseStringDef(line) {
            var parts = line.split(regex);

            assert.identical(parts.length, 3, "Cannot parse data bound property. Invalid syntax.", {
                line: line,
                parts: parts
            });

            return {
                name: parts[1]
            };
        }

        function trackProperty(line, element) {
            var def = this.parseStringDef(line);
            var isListening = true;

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

            if (element instanceof HTMLInputElement) {
                element.addEventListener('input', function() {
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

                if (isTrackedPropertyInResult(result)) {
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
                container.setContents(props.get(def.name, ''));
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);