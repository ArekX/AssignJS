
lib(['compiler', 'object'], function(compiler, object) {
    var TokenConsumer = {
        init: init,
        consume: consume,
        match: match,
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

    function consume(line, data) {
        var result = {};

        for(var i = 0; i < this.tokens.length; i++) {
            var part = this.tokens[i];
            var match = line.match(part.regex);
            if (!match) {
                continue;
            }

            if (match.index === 0) {
                result[part.name] = part.parse ? part.parse(match, result, data) : match[0];
            }

            line = line.substring(match[0].length);
        }

        return result;
    }

    function match(string) {
        return string.match(this.fullMatch);
    }
});
