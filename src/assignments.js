document.querySelector('script[data-assign-js]').$main.set(
	"core.parser.assignments", 
	["core.object"], 
function(object) {
	var regex = /^\s*(<-|->|<->)?\s*?([a-zA-Z_@][a-zA-Z0-9\.]*)(:([a-zA-Z_][a-zA-Z0-9]*))?$/;
	var propertyRegex = /^[@a-zA-Z_](\.[a-zA-Z0-9]+|[a-zA-Z0-9]+)*$/;

	var main = this.main;

	return {
		parse: parseAssignments,
		assign: assignToScope
	};

	function parseAssignments(assignmentsLine, line, element) {
		var assignmentItems = assignmentsLine.split(',');
		var operations = [];
		var firstUseAssignTo = null;
		var firstUseAssignFrom = null;

		for(var i = 0; i < assignmentItems.length; i++) {
			var item = assignmentItems[i];

			var parts = item.split(regex);

			if (parts.length !== 6) {
				main.throwError("Cannot parse assignment part. Invalid syntax.", {
					item: item,
					assignmentLine: assignmentsLine,
					line: line,
					element: element
				});
			}

			if (!parts[1] && firstUseAssignTo === null) {
				main.throwError("Invalid syntax. You must provide first assignment operation.", {
					item: item,
					assignmentLine: assignmentsLine,
					line: line,
					element: element
				});
			}

			if (parts[2].match(propertyRegex) === null) {
				main.throwError("Invalid property.", {
					property: parts[2],
					item: item,
					assignmentLine: assignmentsLine,
					line: line,
					element: element
				});
			}

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
				useAssignTo: useAssignTo,
				useAssignFrom: useAssignFrom,
			});
		}

		return operations;
	}

	function assignToScope(container, parentContainer, assignOperations) {
		
		var parentScope = parentContainer.scope;

		for(var i = 0; i < assignOperations.length; i++) {
			var op = assignOperations[i];

			var item = object.getVar(parentScope, op.item, null);

			if (item === null && op.item !== '@') {
				main.throwError("Cannot find assignment in parent scope.", {
					item: op.item,
					assignOperations: assignOperations,
					container: container
				});
			}

			if (op.useAssignTo) {
				if (parentScope.hasOwnProperty(op.referenceAs)) {
					main.throwError("Assignment already defined in parent.", {
						assignment: op.referenceAs,
						operation: op,
						container: container
					});
				}

				parentScope[op.referenceAs] = container;
			}

			if (op.useAssignFrom) {
				container.scope[op.referenceAs] = op.item !== '@' ? parentScope[op.item] : parentContainer;
			}
		}
	}
});