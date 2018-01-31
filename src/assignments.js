(function(core) {
	core.modules.define("core.assignments", AssignmentsModule);

	AssignmentsModule.deps = [];

	function AssignmentsModule() {
		var assert = core.assert;
		
		var regex = /^\s*(<-|->|<->)?\s*?([a-zA-Z_@][a-zA-Z0-9\.]*)(:([a-zA-Z_][a-zA-Z0-9]*))?$/;
		var propertyRegex = /^[@a-zA-Z_](\.[a-zA-Z0-9]+|[a-zA-Z0-9]+)*$/;

		function Assignments() {}

		Assignments.prototype.parse = parse;

		return new Assignments();

		function parse(assignments) {
			var assignmentItems = assignments.split(',');
			var operations = [];
			var firstUseAssignTo = null;
			var firstUseAssignFrom = null;

			for(var i = 0; i < assignmentItems.length; i++) {
				var item = assignmentItems[i];

				var parts = item.split(regex);

				assert.identical(parts.length, 6, "Cannot parse assignment part. Invalid syntax.", {
					assignments: assignments,
					parts: parts
				});

				assert.isFalse(!parts[1] && firstUseAssignTo === null, "Invalid syntax. You must provide first assignment operation.", {
					assignments: assignments,
					parts: parts
				});

				assert.notIdentical(parts[2].match(propertyRegex), null, "Invalid property.", {
					assignments: assignments,
					parts: parts,
					property: parts[2]
				});

				var useAssignTo = firstUseAssignTo;
				var useAssignFrom = firstUseAssignFrom;

				if (parts[1]) {
					var operators = parts[1].split('-');
					useAssignTo = operators[1] === '>';
					useAssignFrom = operators[0] === '<';

					if (firstUseAssignTo === null) {
						firstUseAssignTo = useAssignTo;
						firstUseAssignFrom = useAssignFrom;	
					}
				}
			
				operations.push({
					item: parts[2],
					referenceAs: parts[3] ? parts[4] : parts[2],
					isInto: useAssignTo,
					isFrom: useAssignFrom,
				});
			}

			return operations;
		}
		
	}
})(document.querySelector('script[data-assign-js-core]').$main);