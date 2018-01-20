document.querySelector('script[data-assign-js]').$main.extend("core.component", ["core.html", "app.main"], function(html, appMain) {
	var module = this.module;

	appMain.routes['/home'] = 'app.pages.home';
	appMain.defaultRoute = '/home';
	
	module.add("app.pages.home", HomePage);
	module.add("app.pages.home.form", Form);
	module.add("app.pages.home.data", Data);
	module.add("app.pages.home.data.item", DataItem);
	
	function HomePage(props) {
		this.template = `
		<h2>Todo List</h2>

		<h3>Form</h3>
		<div data-assign="app.pages.home.form <- @:parent, dataTable:table"></div>

		<h3>Data</h3>
		<div data-assign="app.pages.home.data:dataTable <- @:parent"></div>
		`;
	}

	function Form(props) {
		props.title = "";
		props.text = "";

		this.template = `<div>
			<div>Title: <input data-assign=":title"></div>
			<div>Text: <textarea data-assign=":text"></textarea></div>
			<button data-assign=":btn">Add</button>
		</div>`;

		this.initialize = function(scope) {
			var table = scope.table;
			this.container.events.afterRender.register(() => {
				// This is called multiple times :/
				// lets see how we can make some more lifecycle parts.
				// also lets see if there is some where to make short templates.
				// also needs a way to pass literals in data-assign
				var titleInput = this.container.scope.title;
				var textInput = this.container.scope.text;
				var btn = this.container.scope.btn;

				titleInput.element.oninput = () => {
					this.set('title', titleInput.element.value);
				};

				textInput.element.oninput = () => {
					this.set('text', textInput.element.value);
				}

				btn.element.onclick = () => {
					table.addRow({
						title: props.title,
						text: props.text,
						date: (new Date()).toString()
					});

					titleInput.element.value = "";
					textInput.element.value = "";
					this.setProps({title: '', text: ''});
				};
			});
		}
	}

	function Data(props) {
		props.body = [];
		this.template = `<table style="width: 100%">
		<thead>
		<tr>
		  <th>Title</th>
		  <th>Text</th>
		  <th>Date</th>
		</tr>
		</thead>
		<tbody data-assign="@body">
		</tbody>
		</table>`;

		var self = this;

		this.initialize = function() {
		}

		this.addRow = function(info) {
			props.body.push(getRow(info));
			this.reloadProperty("body");
		}

		function getRow(info) {
			var row = html.create('tr');
			var component = module.create("app.pages.home.data.item", row, self);

			component.setInfo(info);

			return row;
		}
	}

	function DataItem(props) {
		props.title = "";
		props.message = "";
		props.date = "";

		this.template = `
			<td data-assign="@title" style="text-align: center"></td>
			<td data-assign="@text" style="text-align: center"></td>
			<td data-assign="@date" style="text-align: center"></td>
		`;

		this.setInfo = function(info) {
			this.setProps(info);
		}
	}
});