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
        try {
            tests[test]();
            sys.print(green("."));
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
