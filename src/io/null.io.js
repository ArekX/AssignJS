// @import: core

lib(['io'], function(io) {

    io.addHandler('io.null', /_/, {
      read: nullFunction,
      write: nullFunction,
      shouldWrite: nullFunction
    });

    function nullFunction() {
        return false;
    }
});
