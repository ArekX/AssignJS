// @import: core

lib(['io'], function IoBase(io) {

    io.addHandler('io.null', /_/, {
      read: nullFunction,
      write: nullFunction,
      shouldWrite: nullFunction
    });

    function nullFunction() {
        return false;
    }
});
