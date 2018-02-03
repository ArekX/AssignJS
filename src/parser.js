(function(core) {
    "use strict";
    
    core.modules.define("core.parser", ParserModule);

    ParserModule.deps = ["core.event"];

    function ParserModule(makeEventEmitter) {
        var assert = core.assert;

        function Parser() {
            this._parsers = {};
            this.config = {
                strict: true,
                dataKey: 'assign',
                assignmentLinesGetter: null
            };
            this.events = {
                beforeParseAll: makeEventEmitter(this),
                afterParseAll: makeEventEmitter(this)
            };
        }

        Parser.prototype.define = defineParser;
        Parser.prototype.get = getParser;
        Parser.prototype.parse = parse;
        Parser.prototype.parseAll = parseAll;
        Parser.prototype._getAssignLines = getAssignLines;

        return new Parser();

        function defineParser(namespace, checker, parser) {
            assert.namespaceValid(namespace);
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

            return (element.dataset[this.config.dataKey] || "").split(';');
        }

        function parseAll(list) {
            if (!this.events.beforeParseAll.trigger()) {
                return;
            }

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
                    if (!this._parsers.hasOwnProperty(parserName)) {
                        return;
                    }

                    var parse = this._parsers[parserName];
                    var isMatch = core.vars.isFunction(parse.checker) ? parse.checker(line, element) : line.match(parse.checker);

                    if (isMatch) {
                        element.$parsed = true;
                        parse(line, element);
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
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);