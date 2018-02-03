(function(core) {
    core.modules.define("core.assignments", AssignmentsModule);

    AssignmentsModule.deps = [];

    function AssignmentsModule() {
        var assert = core.assert;
        
        var regex = /^\s*(<-|->|<->)?\s*?([a-zA-Z_@][a-zA-Z0-9\.]*|\(.*?\))(:([a-zA-Z_][a-zA-Z0-9]*))?$/;
        var propertyRegex = /^[@a-zA-Z_](\.[a-zA-Z0-9]+|[a-zA-Z0-9]+)*$/;
        var literalRegex = /^\((.*?)\)$/;

        function Assignments() {}

        Assignments.prototype.parse = parse;
        Assignments.prototype._parseAssignmentItems = parseAssignmentItems;
        Assignments.prototype._parsePartsAsLiteral = parsePartsAsLiteral;
        Assignments.prototype._parsePartsAsItem = parsePartsAsItem;

        return new Assignments();

        function parse(assignments) {
            
            var assignmentItems = this._parseAssignmentItems(assignments);
            var operations = [];

            for(var i = 0; i < assignmentItems.length; i++) {
                var item = assignmentItems[i];

                var parts = item.split(regex);

                assert.identical(parts.length, 6, "Cannot parse assignment part. Invalid syntax.", {
                    assignments: assignments,
                    parts: parts
                });

                var propertyResult = parts[2].match(propertyRegex);
                var literalResult = parts[2].match(literalRegex);

                assert.notIdentical(propertyResult, literalResult, "Invalid property.", {
                    assignments: assignments,
                    parts: parts,
                    property: parts[2]
                });

                operations.push(literalResult !== null ? this._parsePartsAsLiteral(parts) : this._parsePartsAsItem(parts));
            }

            return operations;
        }

        function parseAssignmentItems(assignmentLine) {
            var assignmentItems = [];

            var regex = /\(.*?\)(:([a-zA-Z_][a-zA-Z0-9]*))?/
            var match = null;

            while((match = assignmentLine.match(regex)) !== null)  {
                assignmentItems.push(match[0]);
                assignmentLine = assignmentLine.substr(0, match.index) + assignmentLine.substr(match.index + match[0].length);
            }

            assignmentLine = assignmentLine.replace(/\,(\s*\,)+/g, ',').trim();

            return assignmentItems.concat(assignmentLine.split(',')).filter(function(item) {
                return item.length > 0;
            });
        }

        function parsePartsAsItem(parts) {
            return {
                type: "item",
                value: parts[2],
                name: parts[3] ? parts[4] : parts[2]
            }
        }

        function parsePartsAsLiteral(parts) {
            var referenceAs = parts[3] ? parts[4] : null;
            var literalValue = null;

            var split = parts[2].split(literalRegex);
            var errorData = {
                parts: parts,
                literal: parts[2],
                split: split
            };

            assert.identical(split.length, 3, "Cannot parse assignment literal. Invalid syntax.", errorData);

            try {
                literalValue = JSON.parse(split[1]);
            } catch(e) {
                core.throwError("Cannot parse assignment literal as JSON value.", errorData);
            }

            assert.isTrue(!!referenceAs, "You must provide a reference name when specifying a literal.", {
                literal: parts[2],
                parts: parts
            });

            return {
                type: 'literal',
                value: literalValue,
                name: referenceAs
            };
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);