document.querySelector('script[data-assign-js]').$main.set(
	"core.object", 
	[], 
function() {
	var main = this.main;
	
	return {
		getVar: getVar
	};

	function getVar(object, varname, defaultValue) {
		if (varname in object) {
			return object[varname];
		}

		var walker = object;

		varparts = varname.split('.');

		for(var i = 0; i < varparts.length; i++) {
			if (!(varparts[i] in walker)) {
				return defaultValue;
			}

			walker = walker[varparts[i]];
		}

		if (typeof walker === "undefined") {
			return defaultValue;
		}

		return walker;
	}
});