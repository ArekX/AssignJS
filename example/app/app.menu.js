document.querySelector('script[data-assign-js]').$main.extend("core.component", ["core.html"], function(html) {
	this.module.add("app.menu", AppMenu);

	var menuItems = [
		{
			name: 'Home',
			route: '/home'
		},
		{
			name: 'About',
			route: '/about'
		}
	];

	var aTemplate = html.createTemplate('a', {href: 'javascript:void(0)'});
	
	function AppMenu(props) {
		this.mainApp = null;
		this.template = `<ul data-assign="@items"></ul>`;

		props.items = [];

		for(var i = 0; i < menuItems.length; i++) {
			props.items.push(createListElement(this, menuItems[i]));
		}
	}

	AppMenu.prototype.initialize = function(scope) {
		this.mainApp = scope.mainApp;
	}

	function createListElement(self, route) {
		var el = aTemplate(route.name);

		el.onclick = function() {
			self.mainApp.routeTo(route.route);
		};

		return html.create('li', el);
	}
});