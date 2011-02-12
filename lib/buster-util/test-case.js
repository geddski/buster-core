var sys = require("sys");

function red(str) {
    return "\033[31m" + str + "\033[39m";
};

function green(str) {
    return "\033[32m" + str + "\033[39m";
};

var asyncTestQueue = [];
function onAsyncTestFinished() {
    asyncTestQueue.shift();

    if (asyncTestQueue.length > 0) {
        asyncTestQueue[0]();
    }
};

module.exports = function (name, tests) {
    var failedTests = {};

    sys.print(name + ": ");
    for (var test in tests) {
        if (test == "setUp" || test == "tearDown") {
            continue;
        }

        if (tests[test].async) {
            asyncTestQueue.push(function () {
                var scope = {};
                var timeout = setTimeout(function () {
                    if (tests.tearDown) tests.tearDown.call(scope);
                    sys.puts(red("[ASYNC][TIMEOUT] " + test));
                    onAsyncTestFinished();
                }, 2000);
                scope.end = function () {
                    clearTimeout(timeout);
                    if (tests.tearDown) tests.tearDown.call(scope);
                    sys.puts(green("[ASYNC] " + test));
                    onAsyncTestFinished();
                };

                if (tests.setUp) tests.setUp.call(scope);
                tests[test].call(scope);
            });

            if (asyncTestQueue.length == 1) {
                asyncTestQueue[0]();
            }
            sys.print(green(","));
        } else {
            try {
                var scope = {};
                if (tests.setUp) tests.setUp.call(scope);
                tests[test].call(scope);
                if (tests.tearDown) tests.tearDown.call(scope);
                sys.print(green("."));
            } catch (e) {
                sys.print(red(".")); 
                failedTests[test] = e;
            }
        }
    }

    sys.puts("");

    for (var failedTest in failedTests) {
        var e = failedTests[failedTest];
        sys.puts(red(failedTest + " failed: ") + e.toString());
        if (e.stack) {
            sys.puts(e.stack.split("\n").slice(1).join("\n"));
        }
    }
};

// Can be used to create asynchronous tests. I.e.:
//
//   testCase("foo", {
//       "test me": testCase.async(function (self) {
//           doAsyncStuff(function () {
//               self.end(); // call when test is finished
//           });
//       })
//   });
module.exports.async = function (testFunction) {
    var asyncTestFunction = function () {
        var self = this;
        process.nextTick(function () {
            testFunction.call(self, self);
        });
    };
    asyncTestFunction.async = true;
    return asyncTestFunction;
};