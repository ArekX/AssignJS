function throwError(message, data) {
    var object = {
        message: message
    };
    data = data || {};

    for (var item in data) {
        if (!data.hasOwnProperty(item)) {
            continue;
        }

        object[item] = data[item];
    }

    object.toString = function () {
        return message;
    };

    throw object;
}