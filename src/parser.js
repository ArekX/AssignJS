(function(core) {
	core.modules.define("core.parser", ParserModule);

	ParserModule.deps = ["core.events"];

	function ParserModule(events) {
		var assert = core.assert;

		function Parser() {
			this._parsers = {};
			this.config = {
				strict: true,
				assignmentLinesGetter: null
			};
			this.events = {
				afterParseAll: events.create("base", this)
			};
		}

		Parser.prototype.define = defineParser;
		Parser.prototype.get = getParser;
		Parser.prototype.parse = parse;
		Parser.prototype.parseAll = parseAll;
		Parser.prototype._getAssignLines = getAssignLines;

		return new Parser();

		function defineParser(namespace, checker, parser) {
			assert.validateNamepsace(namespace);
			assert.keyNotSet(namespace, this._parsers, 'This parser is already defined.');

			if (!parser) {
				parser = checker;
			}

			parser.checker = parser.checker || checker;

			this._parsers[namespace] = parser;
		}

		function getParser(namespace) {
			assert.keySet(namespace, this._parsers, 'Parser is not defined.');
			return this._parsers[namespace];
		}

		function getAssignLines(element) {
			if (this.config.assignmentLinesGetter) {
				return this.config.assignmentLinesGetter(element);
			}

			return element.dataset.assign.split(';');
		}

		function parseAll(list) {
			for(var i = 0; i < list.length; i++) {
				this.parse(list[i]);
			}

			this.events.afterParseAll.trigger();
		}

		function parse(element) {
			if (element.$parsed) {
				return;
			}

			var assignLines = this._getAssignLines(element);

			for (var i = 0; i < assignLines.length; i++) {
				var line = assignLines[i].trim();

				for(var parserName in this._parsers) {
					if (!parsers.hasOwnProperty(parserName)) {
						return;
					}

					var parser = this._parsers[parserName];

					var isMatch = core.vars.isFunction(parser.check) ? parser.check(line, element) : line.match(parser.check);

					if (isMatch) {
						element.$parsed = true;
						parser.handler(line, element);
						break;
					}
				}

				if (element.$parsed || !this.config.strict) {
					return;
				}

				core.throwError("Cannot parse assigment!", {
					assignment: line,
					assignmentList: assignLines,
					element: element
				});
			}

			this.events.afterParse.trigger();
		}
	}
})(document.querySelector('script[data-assign-js-core]').$main);