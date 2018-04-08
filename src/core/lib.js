"use strict";

var core = Object.create({}, {
    versionCode: {value: 100},
    version: {value: '1.0.0'}
});

function throwError(message, data) {
    var object = {message: message};
    data = data || {};

    for(var item in data) {
        if (!data.hasOwnProperty(item)) {
            continue;
        }

        object[item] = data[item];
    }

    object.toString = function() {
        return message;
    };

    throw object;
}

function lib(required, implementor) {
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
}