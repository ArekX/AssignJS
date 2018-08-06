# AssignJS
AssignJS is a component management library which allows you to structure your DOM elements into separate component items which you can use to code more complex javascript apps more easily. It is made so it can be embedded into any kind of app. It allows you to rename the core library to any name you want. Also the way it was created allows you to write your own parsers and make it more smarter, and also you can use it to implement your own component systems.

## Quick example usages

### Minimal setup

Minimal setup for usage is as follows:

```html
<div data-assign="app.hello"></div>
<script src="assignjs.js"></script>
<script>
  var vm = AssignJS.create();
  vm.component.add("app.hello", {template: 'Hello world'});
  vm.run();
</script>
```

By defining `data-assign` to any attribute you specify that element will be used in AssignJS context. In above example wherever `data-assign="app.hello"` is specified that means that `app.hello` component will be rendered and `Hello world` will be displayed.

### Binding properties

Properties can be defined inside the component and it will be tracked for changes and re-rendered whenever they change.

```html
<div data-assign="app.hello"></div>
<script src="assignjs.js"></script>
<script>
  var vm = AssignJS.create();
  vm.component.add("app.hello", {
      template:  `Hello world at <span data-assign="@date"></span>`,
      initialProps: function() {
        return {date: null};
      },
      afterViewInit: function() {
         this.props.date = new Date();
         setInterval(() => {
             this.props.date = new Date();
         }, 1000);
      }
  });
  vm.run();
</script>
```

### No template

AssignJS component doesn't require a template. You can just assign it to an element and that element will be controlled by that component.

```html
<div [as]="app.hello">
   Hello world at <span [as]="@date"></span>
</div>
<script src="assignjs.js"></script>
<script>
  var vm = AssignJS.create();
  vm.component.add("app.hello", {
      initialProps: function() {
        return {date: null};
      },
      afterViewInit: function() {
         this.props.date = new Date();
         setInterval(() => {
             this.props.date = new Date();
         }, 1000);
      }
  });
  vm.run();
</script>
```

# Detailed guide

Please refer to Wiki for more info (currently under construction).

## Examples

Examples are found in `example` folder.

# Building

Run `grunt build` to build both minified and dev version in `build` folder.
