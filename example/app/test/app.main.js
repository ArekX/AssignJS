(function(core) {
    "use strict";

    core.modules.define("app.routes", AppRoutes);

    AppRoutes.deps = ['core.event'];

    function AppRoutes(makeEventEmitter) {
          function AppLinks() {
              this.default = null;
              this.currentRoute = null;
              this.routes = {};
              this.onRouteChange = makeEventEmitter(this);
          }

          AppLinks.prototype.setDefault = function(linkName) {
              this.default = linkName;
          }

          AppLinks.prototype.goToHome = function() {
              if (this.default !== null) {
                 this.changeRoute(this.default);
              }
          }

          AppLinks.prototype.addRoute = function(linkName, info) {
               this.routes[linkName] = info;
          };

          AppLinks.prototype.changeRoute = function(linkName) {
               console.log(linkName);
               this.currentRoute = linkName;
               this.onRouteChange.trigger(this.routes[linkName].route);
          };

          AppLinks.prototype.getTitle = function(linkName) {
               return this.routes[this.currentRoute].title;
          };

          return new AppLinks();
    }

    core.modules.extend("core.components", AppMainModule);

    AppMainModule.deps = ['app.routes'];

    function AppMainModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.main', AppMain);

        function AppMain() {
            this.createLink = html.createTemplate('a', {
              attrs: {
                href: 'javascript:void(0)', 
                dataAssign: "click#changeRoute(%[data-route])"
              },
              style: {
                marginRight: '10px'
              }
            });

            appRoutes.onRouteChange.register(this._changeChildComponent.bind(this));
        }

        AppMain.prototype.template = `
            <h1>App with multiple child components example</h1>
            <div data-assign="@navLinks"></div>
            <div data-assign="@child"></div>
        `;


        AppMain.prototype.initialize = function() {
            this.props.set("changeRoute", function(event, readValue) {
                appRoutes.changeRoute(readValue);
            });
            var links = [];

            for(var route in appRoutes.routes) {
                if (!appRoutes.routes.hasOwnProperty(route)) {
                    continue;
                }

                links.push(this.createLink(route, {attrs: {dataRoute: route}}));
            }

            this.props.set("navLinks", links);

            if (appRoutes.default) {
                appRoutes.goToHome();
            }
        };


        AppMain.prototype._changeChildComponent = function(routeComponent) {
            this.props.set("child", html.create('route', {attrs: {dataAssign: routeComponent}}));
        };
    }

})(AssignJS);