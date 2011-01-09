function testCase(name, tests) {
    var testCase = TestCase(name);

    for (var test in tests) {
        if (test != "setUp" && test != "tearDown") {
            testCase.prototype["test " + test] = tests[test];
        } else {
            testCase.prototype[test] = tests[test];
        }
    }

    return testCase;
}

var assert = this;

(function () {
    var mappedAssertions = {
        ok: "True",
        doesNotThrow: "NoException",
        throws: "Exception",
        equal: "Equals"
    };

    for (var assertion in mappedAssertions) {
        assert[assertion] = assert["assert" + mappedAssertions[assertion]];
    }
}());

if (buster.assert) {
    if (buster.format) {
        buster.assert.format = buster.format.ascii;
    }

    buster.assert.fail = fail;
}