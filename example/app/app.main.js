document.querySelector('script[data-assign-js]').$main.set("app.main", ["core.html", "core.component"], function(html, component) {
	var main = this;

	component.add("app.main", MainApp);

	var module = {
		defaultRoute: '',
		routes: {}
	};

	function MainApp(props) {
		this.route = null;
		this.template = `<div data-assign="@route"></div>`;
	}

	MainApp.prototype.initialize = function(scope) {
		this.routeTo(module.defaultRoute);
	}

	MainApp.prototype.routeTo = function(routeName) {
		this.set('route', html.create('div', {'data-assign': module.routes[routeName]}));
	}

	return module;
});