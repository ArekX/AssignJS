(function(core) {
    "use strict";
    core.modules.define("core.components", ComponentModule);

    ComponentModule.deps = ["core.container.manager", "core.manager.base", "core.parser", "core.event", "core.assignments"];

    function ComponentModule(containerManager, makeManager, parser, makeEventEmitter, assignments) {
        var assert = core.assert;
        var main = this;
        var componentRegex = /^([a-zA-Z0-9_\.-]+)(:([a-zA-Z_][a-zA-Z0-9]+))?(\s*(\<\-.*?))?$/;
        
        function ComponentManager() {
            this.config = {
                container: "core.rendered",
                baseComponent: "core.component.base"
            };
        }

        ComponentManager.prototype = core.vars.extendPrototype(makeManager(), {
            define: defineType,
            parseStringDef: parseStringDef,
            makeComponent: makeComponent
        });

        var manager = new ComponentManager();

        parser.define("core.component", componentRegex, function(line, element) {
              var defConfig = manager.parseStringDef(line);
              manager.makeComponent(element, defConfig);
        });

        return manager;

        function parseStringDef(line) {
            var parts = line.split(componentRegex);

            assert.identical(parts.length, 7, "Cannot parse component assignment. Invalid property syntax.", {
                line: line,
                parts: parts
            });
            
            return {
                type: parts[1],
                referenceAs: parts[3] ? parts[3] : null,
                assignments: parts[4] ? assignments.parse(parts[4]) : null
            };
        }

        function defineType(type, factory, extendsFactory) {
            if (extendsFactory !== null) {
                var baseComponentName = core.vars.defaultValue(extendsFactory, this.config.baseComponent);
                factory.prototype = core.vars.extendPrototype(this.get(baseComponentName).prototype, factory.prototype);
            }

            this.super.define.call(this, type, factory);
        }

        function makeComponent(element, config) {
            var container = containerManager.wrapElement(element, this.config.container);

            if (!container.getParent() && config.parent) {
                container.setParent(config.parent.container);
            };

            var parentContainer = container.getParent();
            var scope = container.scope;
            var factory = this.get(config.type);

            var instance = new factory();

            instance.setup(config, container);

            if (config.destroyable === false) {
                container.setDestroyable(false);
            }

            container.setPayload(instance);
            container.setupAssignments(config.assignments);

            if (config.referenceAs) {
                var parent = scope.getParent();

                if (parent) {
                    parent.set(config.referenceAs, container);
                }

                scope.set(config.referenceAs, container);
            }

            container.registerEvent('afterLink', initializeComponent);
            container.registerEvent('beforeUnlink', unsetComponent);

            if (parentContainer) {
                parentContainer.registerEvent('beforeUnlink', function() {
                    container.unlink();
                });
            }

            return instance;

            function initializeComponent() {
                instance.initialize && instance.initialize();
            }

            function unsetComponent() {
                if (!config.referenceAs) {
                    return;
                }

                var parent = scope.getParent();

                if (parent) {
                    parent.unset(config.referenceAs);
                }
            }
        }

    }
})(document.querySelector('script[data-assign-js-core]').$main);