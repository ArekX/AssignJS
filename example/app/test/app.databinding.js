(function(core) {
    "use strict";

    core.modules.extend("core.components", AppHomeModule);

    AppHomeModule.deps = ['app.routes'];

    function AppHomeModule(appRoutes) {

        var module = this.module;
        var html = core.html;

        module.define('app.databinding', AppDataBinding);
        appRoutes.addRoute('Data Binding', {
            route: 'app.databinding',
            title: 'Data Binding Test'
        });

        function AppDataBinding() {}

        AppDataBinding.prototype.initialize = function() {
            this.props.set("data", "");
            this.props.set("defaultData", "Hello");
            this.props.set("items", [
                html.create('option', 'World!', {attrs: {value: 'Hello'}}),
                html.create('option', 'Ojha!', {attrs: {value: 'ojha'}}),
            ]);

            this.props.set("changeData", function(event, defaultData) {
                 this.props.set("data", defaultData);
            });
        };

        AppDataBinding.prototype.template = `
            Two way data binding:
            <div>
                Input 1:
                <input data-assign="input@data" type="text" />
            </div>

            <div>
                Input 2:
                <input data-assign="input@data" type="text" />
            </div>

            <p>Data bound result: <span data-assign="@data"></span></p>

            <select data-assign="change@data" data-assign-options="@items <> :html" multiple>
                <option value="value1"> Value 1</option>
                <option value="someValue_2">Value 2</option>
                <option value="value3">Value 3</option>
                <option value="Hello">Hello</option>
                <option value="Hello World">Hello World</option>
            </select>

            <input type="range" name="a" value="50" data-assign="input@data">

            <textarea data-assign="input@data"></textarea>
            <input type="checkbox" data-assign="change@data" value="Hello" />
            <input type="radio" data-assign="change@data" value="Hello" />
            <input type="radio" data-assign="change@data <> checked:checked" value="Hello World" />

            <div>
                <button data-assign="click#data <> [data-value]" data-value="Hello">Set data to "Hello"</button><br>
                <button data-assign="click#data <> [data-value]" data-value="Hello World">Set data to "Hello World"</button><br>
                <button data-assign="click#data <> [data-value]" data-value="">Clear data</button><br>
                <button data-assign="click#changeData(defaultData)">Test</button>
            </div>
        `;
    }

})(AssignJS);