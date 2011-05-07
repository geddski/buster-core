if (typeof require != "undefined") {
    var buster = require("../lib/buster-core");
    buster.util = require("buster-util");
    var assert = require("assert");
    var sinon = require("sinon");
}

buster.util.testCase("BusterBindTest", {
    "should call function with bound this object": function () {
        var func = sinon.spy();
        var obj = {};
        var bound = buster.bind(obj, func);

        bound();
        assert.equal(func.thisValues[0], obj);

        bound.call({});
        assert.equal(func.thisValues[1], obj);

        bound.apply({});
        assert.equal(func.thisValues[2], obj);
    },

    "should call method with bound this object": function () {
        var obj = { meth: sinon.spy() };
        var bound = buster.bind(obj, "meth");

        bound();
        assert.equal(obj.meth.thisValues[0], obj);

        bound.call({});
        assert.equal(obj.meth.thisValues[1], obj);

        bound.apply({});
        assert.equal(obj.meth.thisValues[2], obj);
    },

    "should call function with bound arguments": function () {
        var func = sinon.spy();
        var obj = {};
        var bound = buster.bind(obj, func, 42, "Hey");

        bound();

        assert.ok(func.calledWith(42, "Hey"));
    },

    "should call function with bound arguments and passed arguments": function () {
        var func = sinon.spy();
        var obj = {};
        var bound = buster.bind(obj, func, 42, "Hey");

        bound("Bound", []);
        assert.ok(func.calledWith(42, "Hey", "Bound", []));

        bound.call(null, ".call", []);
        assert.ok(func.calledWith(42, "Hey", ".call", []));

        bound.apply(null, [".apply", []]);
        assert.ok(func.calledWith(42, "Hey", ".apply", []));
    }
});

buster.util.testCase("BusterIsArgumentsTest", {
    "should recognize real arguments object": function () {
        assert.ok(buster.isArguments(arguments));
    },

    "should reject primitive": function () {
        assert.ok(!buster.isArguments(42));
    },

    "should reject object without length": function () {
        assert.ok(!buster.isArguments({}));
    },

    "should reject array": function () {
        assert.ok(!buster.isArguments([]));
    }
});

buster.util.testCase("BusterKeysTest", {
    "should return keys of object": function () {
        var obj = { a: 1, b: 2, c: 3 };

        assert.equal(buster.keys(obj).sort().join(""), "abc");
    },

    "should exclude inherited properties": function () {
        var obj = { a: 1, b: 2, c: 3 };
        var obj2 = buster.create(obj);
        obj2.d = 4;
        obj2.e = 5;

        assert.deepEqual(buster.keys(obj2).sort().join(""), "de");
    }
});

buster.util.testCase("BusterCreateTest", {
    "should create object inheriting from other object": function () {
        var obj = {};

        assert.ok(obj.isPrototypeOf(buster.create(obj)));
    }
});

buster.util.testCase("BusterFunctionNameTest", {
    "should get name from function declaration": function () {
        function myFunc() {}

        assert.equal(buster.functionName(myFunc), "myFunc");
    },

    "should get name from named function expression": function () {
        var myFunc = function myFuncExpr() {}

        assert.equal(buster.functionName(myFunc), "myFuncExpr");
    }
});

if (buster.require) {
    buster.util.testCase("BusterRequireTest", {
        "should extend buster with a buster module": function () {
            buster.require("util");

            assert.ok(typeof buster.testCase == "function");
        }
    });
}