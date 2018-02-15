(function(core) {
    "use strict";
    
    core.modules.extend("core.container.manager", ComponentScopeProperty);

    ComponentScopeProperty.deps = ["core.parser", "core.manager.base", "core.container.manager"];

    function ComponentScopeProperty(parser, makeManager, containerManager) {
        var module = this.module;
        var assert = core.assert;
        var vars = core.vars;

        var regex =  /^\s*:([a-zA-Z_][a-zA-Z0-9]+)$/;
        var argumentsRegex = /^\((.*?)\)$/;

        function ScopeProperty() {
            this.config = {
                container: "core.base"
            };
        }

        ScopeProperty.prototype = core.vars.extendPrototype(makeManager(), {
            parseStringDef: parseStringDef,
            scopeProperty: scopeProperty
        });

        var manager = new ScopeProperty();

        parser.define("core.component.scope.property", regex, manager.scopeProperty.bind(manager));

        return manager;

        function parseStringDef(line) {
            var parts = line.split(regex);

            assert.identical(parts.length, 3, "Cannot parse tracked property. Invalid syntax.", {
                line: line,
                parts: parts
            });

            return {
                scopeName: parts[1]
            };
        }

        function scopeProperty(line, element) {
            var def = this.parseStringDef(line);
            var container = containerManager.wrapElement(element, this.config.container);
            var parent = container.getParent();

            container.scope.getParent().set(def.scopeName, element);
            
            if (parent) {
                container.events.register('beforeUnlink', function() {
                    parent.scope.unset(def.scopeName);
                });

                parent.events.register('beforeUnlink', function() {
                    container.unlink();
                });
            }
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);