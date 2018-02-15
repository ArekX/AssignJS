(function(core) {
    "use strict";

    core.modules.extend("core.components", AppHomeModule);

    AppHomeModule.deps = ['app.routes'];

    function AppHomeModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.example', AppExample);
        appRoutes.addRoute('Example', {
            route: 'app.example',
            title: 'Example page'
        });

        function AppExample() {}

        AppExample.prototype.template = `
            <h2>Another example page</h2>

            <img src="https://placeimg.com/640/480/any" width="640" height="480" alt="Example image" />
        `;
    }

})(AssignJS);