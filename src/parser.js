document.querySelector('script[data-assign-js]').$main.set(
	"core.parser", 
	["core.events.emitter"], 
function(createEvent) {
	var main = this.main;
	var parsers = {};
	var afterParseEvent = createEvent(null);
	var config = {
		selector: "[data-assign]",
		strict: true
	};

	main.registerRunnable(this.name, [], runParser);
	main.registerConfigurator(this.name, function(options) {
		config = main.mergeConfig(config, options);
	});

	return {
		add: addParser,
		as: getParser,
		parse: parse,
		events: {
			afterParse: afterParseEvent
		}
	};

	function runParser() {
		parse(document);
	}

 	function addParser(parserName, check, handler) {
		main.assertValidNamespace(parserName);

		if (parsers.hasOwnProperty(parserName)) {
			main.throwError("Parser already defined!", {
				parserName: parserName,
				check: check,
				handler: handler
			});
		}

		parsers[parserName] = {
			check: check,
			handler: handler
		};
	}

	function getParser(parserName) {
		if (!(parserName in parsers)) {
			main.throwError("Parser is not defined!", {
				parserName: parserName
			});
		}

		return parsers[parserName];
	}

	function parse(parent, options) {
		options = main.mergeConfig(options || {}, config);

		var assignItems = parent.querySelectorAll(options.selector);

		for(var i = 0; i < assignItems.length; i++) {
			var item = assignItems[i];

			if (item.$parsed) {
				continue;
			}

			var assignLines = item.dataset.assign.split(';');

			for (var j = 0; j < assignLines.length; j++) {
				var line = assignLines[j].trim();

				var parsed = false;

				for(var parserName in parsers) {
					if (!parsers.hasOwnProperty(parserName)) {
						continue;
					}

					var parser = parsers[parserName];
					var isMatch = typeof parser.check === "function" ? parser.check(line, item) : line.match(parser.check);

					if (isMatch) {
						item.$parsed = true;
						parser.handler(line, item);
						parsed = true;
						break;
					}
				}

				if (parsed || !options.strict) {
					continue;
				}

				main.throwError("Cannot parse assigment!", {
					assignment: line,
					assignmentList: assignLines,
					element: item
				});
			}
		}

		afterParseEvent.trigger(parent, options);
	}
});