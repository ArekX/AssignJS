document.querySelector('script[data-assign-js]').$main.set(
	"core.html", 
	["core.container"], 
function(containerManager) {
	var main = this.main;
	
	return {
		create: create,
		createTemplate: createTemplate,
		setContents: setElementContents,
		encode: encode
	};

	function create(tagName, contents, options) {
		if (!options && typeof contents === "object") {
			options = contents;
			contents = "";
		}

		contents = contents || "";
		options = options || {};

		var element = document.createElement(tagName);
		for (var option in options) {
			if (!(option in options)) {
				continue;
			}

			element.setAttribute(option, options[option]);
		}

		setElementContents(element, contents)

		return element;
	}

	function createTemplate(tagName, baseContents, baseOptions) {
		var func = function(contents, options) {
			options = main.mergeConfig(baseOptions || {}, options || {});
			contents = contents || baseContents;

			var element = create(tagName, contents, options);

			if (!options && typeof contents === "object") {
				options = contents;
				contents = "";
			}

			contents = contents || "";
			options = options || {};

			for (var option in options) {
				if (!(option in options)) {
					continue;
				}

				element.setAttribute(option, options[option]);
			}

			setElementContents(element, contents);

			return element;
		};

		func.tag = tagName;

		return func;
	}

	function encode(contents) {
		return contents.replace(/</g, '&lt;').replace(/>/g, '&gt;')
	}

	function setElementContents(element, contents) {
		if (contents === null || typeof contents === "undefined") {
			contents = "";
		}

		if (contents instanceof HTMLElement) {
			if (element.children.length === 1 && contents.parentElement === element) {
				return;
			}

			clearChildElements(element);
			element.appendChild(contents);
			return;
		}

		if (contents instanceof HTMLCollection) {
			if (contents === element.children) {
				return;
			}

			while(contents.length > 0) {
				element.appendChild(contents[0]);
			}

			return;
		}

		if (Array.isArray(contents)) {
			clearChildElements(element);
			for(var i = 0; i < contents.length; i++) {
				element.appendChild(contents[i]);
			}
			return;
		}

		if (element instanceof HTMLInputElement) {
			element.value = contents;
		} else {
			element.innerHTML = contents;
		}

		function clearChildElements(element) {
			while (element.firstChild) {
				var child = element.firstChild;

			    element.removeChild(child);
				child.parentElement = null;
			}
		}
	}
});