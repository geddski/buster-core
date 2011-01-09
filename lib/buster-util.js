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
                obj.appendChild(div);
                obj.removeChild(div);
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

        keys: (function () {
            if (Object.keys) {
                return function (obj) {
                    return Object.keys(obj)
                };
            }

            return function (object) {
                var keys = [];

                for (var prop in object) {
                    if (Object.prototype.hasOwnProperty.call(object, prop)) {
                        keys.push(prop);
                    }
                }

                return keys;
            }
        }()),

        create: (function () {
            function F() {}

            return function create(object) {
                F.prototype = object;
                return new F();
            }
        }()),

        customError: function (name, superError) {
            superError = superError || Error;

            var error = function (msg) {
                this.message = msg;
            };

            error.prototype = this.create(superError.prototype);
            error.prototype.type = name;

            return error;
        }
    };
}());

if (typeof module != "undefined") {
    module.exports = buster.util;
    module.exports.testCase = require("./buster-util/test-case");
}
