# Future changes

* Add only a render function instead of component which returns an template. Or a plain object.
* Join component specific rendering with container, payload should only be the actual component.
* Refactor component lifecycle methods.
* Pass scoped data into constructor of component. Resolve containers into components and scoped elements before.
* Check situation when components are added to property array are older ones being recreated?
* Allow passing of whole component to property array and it will automatically bind to component.owner.
* Allow component property traversal `@propObject.param.anotherParam.value`. User will have to call refresh.
* Make a top root scope automatically so that there is no need data-assign on html element.
* Method aliasing. So that `AssignJS.modules.extend('core.components', function() { return componentFunction })` -> `AssignJS.defineComponent(componentFunction)` `core.alias`
* [DONE] Consider `input@property -> [toAttribute], <- value` means:
    1. Attach on input event get contents from `element.value`, put it to props "property"
    2. On props "property" change, write the changed value to `element.setAttribute('toAttribute')`
    * This also allows different events! `click@property` for instance.
    * Event is optional, if no event is added then the property is not bound to anything - one-way binding
    * Default for input element is `element.value`, for all others is `element.innerHTML`
    * If property is not called as a function then data is always set to it.
    * If property is called as a function then that property is never set.
    * When calling event bound function to property first argument is always an event which got triggered.

* Allow property passing into child components, type: `app.child.component <- @propFromParent:name, @propFromParent2`
* Allow data attribute passing, type: `app.child.component <- %[data-attribute]:name, %[attribute]:name`
* Allow data base value passing, type: `app.child.component <- %html:html, %value:value`
* Consider always putting % for %html, %value and %checked so we stay consistent.
* Move props into container.
* Allow no-state function to be passed to renderer, it will always be called when its invalidated.