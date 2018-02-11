(function(core) {
    "use strict";

    core.modules.extend("core.components", AppHomeModule);

    AppHomeModule.deps = ['app.routes'];

    function AppHomeModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.about', AppAbout);
        appRoutes.addRoute('About', 'app.about');

        function AppAbout() {
        }

        AppAbout.prototype.template = `
            <h2>This is an about page</h2>

            Example version 1.0

            <button data-assign=":homeButton">Go to Home</button>
        `;

        AppAbout.prototype.afterInit = function() {
             var homeButton = this.scope.get('homeButton');

             homeButton.onclick = () => {
                  appRoutes.goToHome();
             };
        };
    }

})(AssignJS);