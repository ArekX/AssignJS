(function(core) {
    "use strict";

    function Alias(aliasTarget) {
        this.target = aliasTarget; 
    }

    Alias.prototype.set = setAlias;

    var assert = core.assert;
    core.do = {};
    core.alias = new Alias(core.do);
    return;

    function setAlias(aliasName, callback) {
        assert.keyNotSet(aliasName, this.target, 'This alias is already set!', {alias: aliasName, callback: callback});
        this.target[aliasName] = callback;
    }

})(document.querySelector('script[data-assign-js-core]').$main);