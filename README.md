# AssignJS
Assignment JS library and general purpose framework.

# How to use

AssignJS is a component framework which allows you to structure your DOM elements into separate component items which you can use to code more complex javascript apps more easily. It is made so it can be embedded into any kind of app. It allows you to rename the core library to any name you want. Also the way it was created allows you to write your own parsers and make it more smarter, and also you can use it to implement your own component systems.

## Usage

Minimal setup for usage is as follows:

```html
<div data-assign="app.hello"></div>
<script src="assignjs.js"></script>
<script>
  AssignJS.modules.extend("core.components", function() { 
    this.module.define("app.hello", function AppHello() {
      this.template = "Hello world.";
    });
  });
  AssignJS.run();
</script>
```

By defining `data-assign` to any attribute you specify that element will be used in AssignJS context. In above example wherever `data-assign="app.hello"` is specified that means that `app.hello` component will be rendered and `Hello world` will be displayed.

# Building

Run `grunt build` to build both minified and dev version in `build` folder.