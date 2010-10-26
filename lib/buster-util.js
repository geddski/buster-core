if (typeof buster == "undefined") {
    var buster = {};
}

buster.util = (function () {
    var toString = Object.prototype.toString;
    var div = typeof document != "undefined" && document.createElement("div");

    return {
        isNode: function (obj) {
            if (!div) {
                return false;
            }

            try {
                div.appendChild(obj);
                div.removeChild(obj);
            } catch (e) {
                return false;
            }

            return true;
        },

        isElement: function (obj) {
            return obj && this.isNode(obj) && obj.nodeType === 1;
        },

        isArguments: function (obj) {
            if (typeof obj != "object" || typeof obj.length != "number" ||
                toString.call(obj) == "[object Array]") {
                return false;
            }

            if (typeof obj.callee == "function") {
                return true;
            }

            try {
                obj[obj.length] = 6;
                delete obj[obj.length];
            } catch (e) {
                return true;
            }

            return false;
        },

        keys: Object.keys || function (object) {
            var keys = [];

            for (var prop in object) {
                if (Object.prototype.hasOwnProperty.call(object, prop)) {
                    keys.push(prop);
                }
            }

            return keys;
        }
    };
}());

if (typeof module != "undefined") {
    module.exports = buster.util;
}
