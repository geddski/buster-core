var sys = require("sys");

function red(str) {
    return "\033[31m" + str + "\033[39m";
};

function green(str) {
    return "\033[32m" + str + "\033[39m";
};

module.exports = function (name, tests) {
    var failedTests = {};

    sys.print(name + ": ");
    for (var test in tests) {
        if (test == "setUp" || test == "tearDown") {
            continue;
        }

        try {
            var scope = {};
            if (tests.setUp) tests.setUp.call(scope);
            tests[test].call(scope);

            if (scope.async) {
                var timeout = setTimeout(function () {
                    if (tests.tearDown) tests.tearDown.call(scope);
                    sys.puts(red("Timed out:") + " " + test);
                }, 2000);
                scope.end = function () {
                    clearTimeout(timeout);
                    if (tests.tearDown) tests.tearDown.call(scope);
                };
                sys.print(green(","));
            } else {
                if (tests.tearDown) tests.tearDown.call(scope);
                sys.print(green("."));
            }
        } catch (e) {
            sys.print(red(".")); 
            failedTests[test] = e;
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
    return function () {
        var self = this;
        this.async = true;
        process.nextTick(function () {
            testFunction.call(self, self);
        });
    };
};