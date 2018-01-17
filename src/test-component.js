document.querySelector('script[data-assign-js]').$main.extend("core.component", ["core.html"], function(html) {
	this.module.add("app.controllerComponent", AppComponent);
	
	function AppComponent() {

	}

	AppComponent.prototype.initialize = function(scope) {
		this.props.property = "I am data bound";

		var input = scope.input;
		input.onValueChange.register((value) => {
			this.set('property', value);
		});

		input.setValue(this.props.property);

		scope.button.onclick = () => {
			this.set("property", "I am data bound");
			input.setValue(this.props.property);
		};
	}


});