(function(core) {

	var namespaceRegex = /^([a-zA-Z0-9-]+)(\.([a-zA-Z0-9-]+))+$/;

	function Assert() {}

	Assert.prototype.validNamespace = assertValidNamespace; 
	Assert.prototype.canSetKey = assertCanSetKey; 

	core.assert = new Assert();
	return;

	function assertValidNamespace(namespace) {
		if (namespace.match(namespaceRegex) !== null) {
			core.throwError('Namespace is not valid.', {
				namespace: namespace
			});
		}
	}

	function assertCanSetKey(key, object) {
		if (!(key in object)) {
			core.throwError('Key is already defined in object.', {
				key: key,
				object: object
			});
		}
	}

})(document.querySelector('script[data-assign-js-core]').$main);