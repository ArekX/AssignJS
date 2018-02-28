# Future changes

* Add only a render function instead of component which returns an template. Or a plain object.
* Join component specific rendering with container, payload should only be the actual component.
* Refactor component lifecycle methods.
* Pass scoped data into constructor of component. Resolve containers into components and scoped elements before.
* Check situation when components are added to property array are older ones being recreated?
* Allow passing of whole component to property array and it will automatically bind to component.owner.
* Allow component property traversal `@propObject.param.anotherParam.value`. User will have to call refresh.
* [DONE] Make a top root scope automatically so that there is no need data-assign on html element.
* [DONE] Method aliasing. So that `AssignJS.modules.extend('core.components', function() { return componentFunction })` -> `AssignJS.defineComponent(componentFunction)` `core.alias`
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
* Consider always putting % for %html, %value and %checked so we stay consistent.
* Move props into container.
* Allow no-state function to be passed to renderer, it will always be called when its invalidated.
* Passing callback function into html.createTemplate for options so that additional options and logic can be set.
* Circular module dependency detection
* Async (not promised) modules

Ideas:

* Passthrough scope?
* "Multiple inheritance" via Object.create to combine multiple items and create one object.

* Property parent?
* Factory {push: name, factory; create: name, params; extend: what, newName, withItems} 
    * core.factory ? For making core objects. core.factory.make() or in their own places... core.events.make() ?
* Linkable {setParent, getParent, getChildren, getChild, trackId keeping, onParentChange: null} ?
* We need a consistent internal api, construct() -> initialize -> afterInit -> beforeDestory -> destroy -> afterDestory
* Property Wrap chaining props.events.onCreate().onUpdate().onDelete()
* Event group chaining! When list is defined make that register function! 'beforeLink' -> onBeforeLink (returns this)
* Alias making component
* Alias continus functions.
* Error throwing might need fixing. Can we write out json object in stack trace?
* Set container contents? Can we do so that on element remove its destructruction is queued somewhere?
* DI ?