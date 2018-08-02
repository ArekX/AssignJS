var originalImplementors = ([]).concat(implementors);

function makeNewInstance(config) {
    config = config || {};
    var implementorList = config.pure ? originalImplementors : implementors;

    var core = Object.create({}, {
        versionCode: {
            value: versionCode
        },
        version: {
            value: versionString
        }
    });

    core.instanceConfig = config;

    for (var i = 0; i < implementorList.length; i++) {
        implementorList[i].apply(core);
    }

    return core;
}
