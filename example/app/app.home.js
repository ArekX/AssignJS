(function(core) {
    "use strict";

    core.modules.extend("core.components", AppHomeModule);

    AppHomeModule.deps = ['app.routes'];

    function AppHomeModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.home', AppHome);
        appRoutes.addRoute('Home', {
            route: 'app.home',
            title: 'Home'
        });
        appRoutes.setDefault('Home');

        function AppHome() {
        }

        AppHome.prototype.template = `
            <h2>This is a home page</h2>
            <div data-assign="app.lipsum"></div>
            <button data-assign="click#goToAbout()">Go to About</button>
        `;

        AppHome.prototype.initialize = function() {
            this.props.set("goToAbout", function() {
                appRoutes.changeRoute('About');
            });
        }

        module.define('app.lipsum', AppLipsum);

        function AppLipsum() {
           this.template = `
            <p>
            Charming villain driving gloves holiday waiter, charming villain stache holiday waiter freestyle elit driving gloves charlie chaplin, stache charlie chaplin holiday waiter tache circus strongman boogie nights testosterone trophy charming villain dick van dyke luxurious elit tudor philosopher driving gloves freestyle albert einstein?
            </p>
            <p>
            Id nefarious nuremberg rally Daniel plainview, give him what-for cardinal richelieu tom selleck Nostrilis tickler blue oyster bar class definer jolly good show nefarious Daniel plainview facial accessory id nuremberg rally, id cardinal richelieu tom selleck hair trimmer give him what-for admiral Nostrilis tickler facial accessory by jingo. jolly good show hair trimmer nuremberg rally nefarious hulk hogan class definer mr frothy-top blue oyster bar Daniel plainview?
            </p>

           `;

           this.destroy = function() {
               console.log('app.lipsum child of app.home is destroyed.');
           };
        }
    }

})(AssignJS);