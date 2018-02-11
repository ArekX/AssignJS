(function(core) {
    "use strict";
    
    core.modules.define("core.parser", ParserModule);

    ParserModule.deps = ["core.event"];

    function ParserModule(makeEventEmitter) {
        var assert = core.assert;
        var html = core.html;

        function Parser() {
            this._parsers = {};
            this._currentParseStack = [];
            this._parseStacks = [];
            this.config = {
                strict: true,
                selector: '[data-assign]',
                dataKey: 'assign',
                assignmentLinesGetter: null
            };
            this.events = {
                beforeBeginStack: makeEventEmitter(this),
                afterEndStack: makeEventEmitter(this),
                beforeParseAll: makeEventEmitter(this),
                afterParseAll: makeEventEmitter(this)
            };
        }

        Parser.prototype.define = defineParser;
        Parser.prototype.get = getParser;
        Parser.prototype.compile = compileFromText;
        Parser.prototype.getParseableElements = getParseableElements;
        Parser.prototype.parse = parse;
        Parser.prototype.parseAll = parseAll;
        Parser.prototype.begin = beginStack;
        Parser.prototype.pushElement = pushToParseStack;
        Parser.prototype.end = endStack;
        Parser.prototype._getAssignLines = getAssignLines;

        return new Parser();

        function beginStack() {
            this.events.beforeBeginStack.trigger();
            this._parseStacks.push(this._currentParseStack);
            this._currentParseStack = [];
        }

        function getParseableElements(parentElement) {
            return parentElement.querySelectorAll(this.config.selector);
        }

        function pushToParseStack(element) {
            var assignElements = this.getParseableElements(element);

            for(var i = 0; i < assignElements.length; i++) {
                if (assignElements[i].$parsed) {
                    continue;
                }

                this._currentParseStack.push(assignElements[i]);
            }

            if (!element.$parsed && element.dataset && element.dataset.hasOwnProperty(this.config.dataKey)) {
                this._currentParseStack.push(element);
            }
        }

        function endStack() {
            core.assert.greater(this._parseStacks.length, 0, 'end() cannot be called before begin()');

            var stack = this._currentParseStack;
            this._currentParseStack = this._parseStacks.pop();

            if (stack.length > 0) {
                this.parseAll(stack);
            }

            this.events.afterEndStack.trigger();
        }

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

            var dataset = element.dataset;
            var keys = Object.keys(dataset);
            var lines = [];

            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.config.dataKey) !== -1) {
                    lines.push(dataset[keys[i]]); 
                }
            }

            return lines;
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
                var parsed = false;
                var line = assignLines[i].trim();

                for(var parserName in this._parsers) {
                    if (!this._parsers.hasOwnProperty(parserName)) {
                        return;
                    }

                    var parse = this._parsers[parserName];
                    var isMatch = core.vars.isFunction(parse.checker) ? parse.checker(line, element) : line.match(parse.checker);

                    if (isMatch) {
                        parsed = true;
                        parse(line, element);
                        break;
                    }
                }

                if (parsed || !this.config.strict) {
                    continue;
                }

                core.throwError("Cannot parse assigment!", {
                    assignment: line,
                    assignmentList: assignLines,
                    element: element
                });
            }

            element.$parsed = true;
        }

        function compileFromText(text, ownerTag) {
            var wrapTag = ownerTag || html.create('compiled');
            var element = html.parse(wrapTag, text);

            if (!ownerTag && element.children.length > 1) {
                core.throwError("Compile text must have at least one root element if owner tag is not specified.", {
                    text: text,
                    ownerTag: ownerTag
                });
            }

            this.begin();
            this.pushElement(element);
            this.end();

            return ownerTag ? ownerTag : element.children[0];
        }
    }
})(document.querySelector('script[data-assign-js-core]').$main);