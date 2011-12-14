var buster = (function (buster, setTimeout) {
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

    var div = typeof document != "undefined" && document.createElement("div");
    var isArray = function (arr) {
        return Object.prototype.toString.call(arr) == "[object Array]";
    };

    function flatten(arr) {
        var result = [], arr = arr || [];

        for (var i = 0, l = arr.length; i < l; ++i) {
            result = result.concat(isArray(arr[i]) ? flatten(arr[i]) : arr[i]);
        }

        return result;
    }

    return extend(buster, {
        bind: function (obj, methOrProp) {
            var method = typeof methOrProp == "string" ? obj[methOrProp] : methOrProp;
            var args = Array.prototype.slice.call(arguments, 2);

            return function () {
                var allArgs = args.concat(Array.prototype.slice.call(arguments));
                return method.apply(obj, allArgs);
            };
        },

        partial: function (fn) {
            var args = [].slice.call(arguments, 1);
            return function () {
                return fn.apply(this, args.concat([].slice.call(arguments)));
            };
        },

        create: (function () {
            function F() {}

            return function create(object) {
                F.prototype = object;
                return new F();
            }
        }()),

        extend: extend,

        nextTick: function (callback) {
            if (typeof process != "undefined" && process.nextTick) {
                return process.nextTick(callback);
            }

            setTimeout(callback, 0);
        },

        functionName: function (func) {
            if (!func) return "";
            if (func.displayName) return func.displayName;
            if (func.name) return func.name;

            var matches = func.toString().match(/function\s+([^\(]+)/m);
            return matches && matches[1] || "";
        },

        isNode: function (obj) {
            if (!div) return false;

            try {
                obj.appendChild(div);
                obj.removeChild(div);
            } catch (e) {
                return false;
            }

            return true;
        },

        isElement: function (obj) {
            return obj && buster.isNode(obj) && obj.nodeType === 1;
        },

        parallel: function (fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                    callback = null;
                }
            }

            if (fns.length == 0) { return cb(null, []); }
            var remaining = fns.length, results = [];

            function makeDone(num) {
                return function done(err, result) {
                    if (err) { return cb(err); }
                    results[num] = result;
                    if (--remaining == 0) { cb(null, results); }
                };
            }

            for (var i = 0, l = fns.length; i < l; ++i) {
                fns[i](makeDone(i));
            }
        },

        series: function (fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                }
            }

            var remaining = fns.slice();
            var results = [];

            function callNext() {
                if (remaining.length == 0) return cb(null, results);
                remaining.shift()(next);
            }

            function next(err, result) {
                if (err) return cb(err);
                results.push(result);
                callNext();
            }

            callNext();
        },

        flatten: flatten,

        countdown: function (num, done) {
            return function () {
                if (--num == 0) done();
            };
        }
    });
}(buster || {}, setTimeout));

if (typeof module == "object" && typeof require == "function") {
    module.exports = buster;
    buster.eventEmitter = require("./buster-event-emitter");

    Object.defineProperty(buster, "defineVersionGetter", {
        get: function () {
            return require("./define-version-getter");
        }
    });
}
