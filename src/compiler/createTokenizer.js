
lib(['compiler', 'object'], function CompilerTokens(compiler, object) {
    var TokenConsumer = {
        init: init,
        consume: consume,
        fullMatch: null,
        tokens: null
    };

    compiler.createTokenizer = function(tokens) {
        return object.create(TokenConsumer, [tokens]);
    };

    function init(tokens) {
        var fullSource = "";
        for(var i = 0; i < tokens.length; i++) {
            fullSource += tokens[i].regex.source;
        }

        this.tokens = tokens;
        this.fullMatch = new RegExp(fullSource);
    }

    function consume(line) {
        var result = {};

        for(var i = 0; i < this.tokens.length; i++) {
            var part = this.tokens[i];
            var match = line.match(part.regex);

            if (!match) {
                continue;
            }

            if (match.index === 0) {
                result[part.name] = part.parse ? part.parse(match) : match[0];
            }

            line = line.substr(match[0].length);
        }

        return result;
    }
});