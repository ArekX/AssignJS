# Future changes

* Add only a render function instead of component which returns an template. Or a plain object.
* Join component specific rendering with container, payload should only be the actual component.
* Event binding constructs `@(onClick)=propFunction`, `@(onInput)=propFunction`, etc. Prop function will receive the event as the parameter.
* Add `#propParam` for two-way data binding on input fields. In case of `#propFunction` that function should have getter and setter methods.
* Refactor component lifecycle methods.
* Pass scoped data into constructor of component. Resolve containers into components and scoped elements before.
* Check situation when components are added to property array are older ones being recreated?
* Allow passing of whole component to property array and it will automatically bind to component.owner.
* Allow component property traversal @propObject.param.anotherParam.value. User will have to call refresh.
* Make a top root scope automatically so that there is no need data-assign on html element.