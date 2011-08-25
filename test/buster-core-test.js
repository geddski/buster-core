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
