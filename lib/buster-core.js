var buster = (function (buster, setTimeout) {
    var toString = Object.prototype.toString;
    var div = typeof document != "undefined" && document.createElement("div");
    var setTimeout = setTimeout;

    function extend(target) {
        if (!target) {
            return;
        }

        for (var i = 1, l = arguments.length, prop; i < l; ++i) {
            for (prop in arguments[i]) {
                target[prop] = arguments[i][prop];
            }
        }

        return target;
    }

    if (typeof require == "function" && typeof module == "object") {
        var path = require("path");
        var fs = require("fs");

        buster.defineVersionGetter = function(mod, dirname) {
            Object.defineProperty(mod, "VERSION", {
                get: function () {
                    if (!this.version) {
                        var pkgJSON = path.resolve(dirname, "..", "package.json");
                        var pkg = JSON.parse(fs.readFileSync(pkgJSON, "utf8"));
                        this.version = pkg.version;
                    }

                    return this.version;
                }
            });
        };
    }

    return extend(buster, {
        setTimeout: function (callback, timeout) {
            setTimeout(callback, timeout);
        },

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

        bind: function (obj, methOrProp) {
            var method = typeof methOrProp == "string" ? obj[methOrProp] : methOrProp;
            var args = Array.prototype.slice.call(arguments, 2);

            return function () {
                var allArgs = args.concat(Array.prototype.slice.call(arguments));
                return method.apply(obj, allArgs);
            };
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

        extend: extend,

        customError: function (name, superError) {
            superError = superError || Error;

            var error = function (msg) {
                this.message = msg;
            };

            error.prototype = this.create(superError.prototype);
            error.prototype.type = name;

            return error;
        },

        nextTick: function (callback) {
            if (typeof process != "undefined" && process.nextTick) {
                return process.nextTick(callback);
            }

            buster.setTimeout(callback, 0);
        },

        functionName: function (func) {
            if (!func) return "";
            if (func.displayName) return func.displayName;
            if (func.name) return func.name;

            var matches = func.toString().match(/function\s+([^\(]+)/m);
            return matches && matches[1] || "";
        }
    });
}(buster || {}, setTimeout));

if (typeof module == "object" && typeof require == "function") {
    buster.require = function (module) {
        buster.extend(buster, require("buster-" + module));
    };

    module.exports = buster;
    buster.eventEmitter = require("./buster-event-emitter");
}
