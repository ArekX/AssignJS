(function(core) {
    "use strict";
    AssignJS.modules.extend('core.components', AppTitleModule);
    AppTitleModule.deps = ['app.routes'];

    function AppTitleModule(appRoutes) {
        this.module.define("app.title", AppTitle);

        function AppTitle() {}

        AppTitle.prototype.initialize = function() {
            this.props.set("title", "weee");
            appRoutes.onRouteChange.register(this.reloadTitle.bind(this));
        };

        AppTitle.prototype.reloadTitle = function() {
            core.html.setContents(this.owner, appRoutes.getTitle());
        }
    }
})(AssignJS);