// @import: throwError.js
// @import: version.js

var implementors = [];

function lib(required, implementor) {
    implementors.push(function() {
        
        var core = this;

        if (!implementor) {
            implementor = required;
            required = [];
        }
    
        var data = [];
        for(var i = 0; i < required.length; i++) {
            if (!(required[i] in core)) {
                throwError('Required lib not defined!', {lib: required[i]});
            }
    
            data.push(core[required[i]]);
        }
    
        return implementor.apply(core, data);
    });
}

function makeNewInstance() {
    var core = Object.create({}, {
        versionCode: {
            value: versionCode
        },
        version: {
            value: versionString
        }
    });

    for (var i = 0; i < implementors.length; i++) {
        implementors[i].apply(core);
    }

    return core;
}