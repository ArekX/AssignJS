(function(core) {
    "use strict";

    core.modules.extend("core.components", AppHomeModule);

    AppHomeModule.deps = ['app.routes'];

    function AppHomeModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.home', AppHome);
        appRoutes.addRoute('Home', 'app.home');
        appRoutes.setDefault('Home');

        function AppHome() {
        }

        AppHome.prototype.template = `
            <h2>This is a home page</h2>
            <p>
            Charming villain driving gloves holiday waiter, charming villain stache holiday waiter freestyle elit driving gloves charlie chaplin, stache charlie chaplin holiday waiter tache circus strongman boogie nights testosterone trophy charming villain dick van dyke luxurious elit tudor philosopher driving gloves freestyle albert einstein?
            </p>
            <p>
            Id nefarious nuremberg rally Daniel plainview, give him what-for cardinal richelieu tom selleck Nostrilis tickler blue oyster bar class definer jolly good show nefarious Daniel plainview facial accessory id nuremberg rally, id cardinal richelieu tom selleck hair trimmer give him what-for admiral Nostrilis tickler facial accessory by jingo. jolly good show hair trimmer nuremberg rally nefarious hulk hogan class definer mr frothy-top blue oyster bar Daniel plainview?
            </p>

            <button data-assign=":button">Go to About</button>
        `;

        AppHome.prototype.afterInit = function() {
             var button = this.scope.get('button');

             button.onclick = () => {
                appRoutes.changeRoute('About');
             };
        };
    }

})(AssignJS);