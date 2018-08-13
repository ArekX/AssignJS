
lib(['compiler', 'object'], function(compiler, object) {
    var TokenConsumer = {
        init: init,
        consume: consume,
        match: match,
        clearCache: clearCache,
        cache: null,
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
        this.clearCache();
    }

    function clearCache() {
        this.cache = {};
    }

    function consume(line, data) {
        if (line in this.cache) {
            return object.merge({}, this.cache[line]);

        }

        var parseLine = line;

        var result = {};

        for(var i = 0; i < this.tokens.length; i++) {
            var part = this.tokens[i];
            var match = parseLine.match(part.regex);
            if (!match) {
                continue;
            }

            if (match.index === 0) {
                result[part.name] = part.parse ? part.parse(match, result, data) : match[0];
            }

            parseLine = parseLine.substring(match[0].length);
        }

        return this.cache[line] = result;
    }

    function match(string) {
        return string.match(this.fullMatch);
    }
});
