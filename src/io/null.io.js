// @import: core

lib(['io'], function(io) {

    io.addHandler('io.null', /_/, {
      read: nullFunction,
      write: nullFunction,
      shouldWrite: nullFunction,
      canRead: false
    });

    function nullFunction() {
        return false;
    }
});
