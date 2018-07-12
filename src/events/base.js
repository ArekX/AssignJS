// @import: core

lib(['createFactory'], function EventsBase(createFactory) {
    this.events = {
        factory: createFactory()
    };
});