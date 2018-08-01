var originalImplementors = ([]).concat(implementors);

function makeNewInstance(original) {
    var implementorList = original ? originalImplementors : implementors;

    var core = Object.create({}, {
        versionCode: {
            value: versionCode
        },
        version: {
            value: versionString
        }
    });

    for (var i = 0; i < implementorList.length; i++) {
        implementorList[i].apply(core);
    }

    return core;
}
