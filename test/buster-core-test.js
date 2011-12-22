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

buster.util.testCase("BusterParallelTest", {
    setUp: function () {
        this.fns = [sinon.stub(), sinon.stub(), sinon.stub()];
    },

    "should call all functions": function () {
        buster.parallel(this.fns);

        assert.ok(this.fns[0].calledOnce);
        assert.ok(this.fns[1].calledOnce);
        assert.ok(this.fns[2].calledOnce);
    },

    "should call callback immediately when no functions": function () {
        var callback = sinon.spy();
        buster.parallel([], callback);

        assert.ok(callback.calledOnce);
    },

    "should do nothing when no functions and no callback": function () {
        assert.doesNotThrow(function () {
            buster.parallel([]);
        });
    },

    "should not fail with no callback": function () {
        assert.doesNotThrow(function () {
            buster.parallel([sinon.stub().yields()]);
        });
    },

    "should not call callback immediately": function () {
        var callback = sinon.spy();
        buster.parallel(this.fns, callback);

        assert.ok(!callback.calledOnce);
    },

    "should call callback when single function completes": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields()], callback);

        assert.ok(callback.calledOnce);
    },

    "should not call callback when first function completes": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.spy(), sinon.stub().yields()], callback);

        assert.ok(!callback.calledOnce);
    },

    "should call callback when all functions complete": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields(), sinon.stub().yields()], callback);

        assert.ok(callback.calledOnce);
    },

    "should pass results to callback": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields(null, 2),
                         sinon.stub().yields(null, 3)], callback);

        assert.ok(callback.calledWith(null, [2, 3]));
    },

    "should immediately pass error to callback": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields({ message: "Ooops" }),
                         sinon.stub().yields(null, 3)], callback);

        assert.ok(callback.calledWith({ message: "Ooops" }));
    },

    "should only call callback once": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields({ message: "Ooops" }),
                         sinon.stub().yields({ message: "Nooo!" })], callback);

        assert.ok(callback.calledOnce);
    },

    "should only call callback once with one failing and one passing": function () {
        var callback = sinon.spy();
        buster.parallel([sinon.stub().yields(null), sinon.stub().yields({})], callback);

        assert.ok(callback.calledOnce);
    }
});

buster.util.testCase("BusterSeriesTest", {
    setUp: function () {
        this.fns = [sinon.stub(), sinon.stub(), sinon.stub()];
    },

    "calls first function": function () {
        buster.series(this.fns);

        assert.ok(this.fns[0].calledOnce);
        assert.ok(!this.fns[1].called);
        assert.ok(!this.fns[2].called);
    },

    "calls callback immediately when no functions": function () {
        var callback = sinon.spy();
        buster.series([], callback);

        assert.ok(callback.calledOnce);
    },

    "does nothing when no functions and no callback": function () {
        assert.doesNotThrow(function () {
            buster.series([]);
        });
    },

    "does not fail with no callback": function () {
        assert.doesNotThrow(function () {
            buster.series([sinon.stub().yields()]);
        });
    },

    "does not call callback immediately": function () {
        var callback = sinon.spy();
        buster.series(this.fns, callback);

        assert.ok(!callback.calledOnce);
    },

    "calls callback when single function completes": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields()], callback);

        assert.ok(callback.calledOnce);
    },

    "calls callback when single promise resolves": function () {
        var callback = sinon.spy();
        var promise = { then: sinon.stub().yields() };
        buster.series([sinon.stub().returns(promise)], callback);

        assert.ok(callback.calledOnce);
    },

    "does not call callback when first function completes": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields(), sinon.spy()], callback);

        assert.ok(!callback.calledOnce);
    },

    "calls next function when first function completes": function () {
        var callback = sinon.spy();
        var fns = [sinon.stub().yields(), sinon.spy()];
        buster.series(fns, callback);

        assert.ok(fns[1].calledOnce);
    },

    "calls next function when first promise resolves": function () {
        var callback = sinon.spy();
        var promise = { then: sinon.stub().yields() };
        var fns = [sinon.stub().returns(promise), sinon.spy()];
        buster.series(fns, callback);

        assert.ok(fns[1].calledOnce);
    },

    "calls callback when all functions complete": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields(), sinon.stub().yields()], callback);

        assert.ok(callback.calledOnce);
    },

    "passes results to callback": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields(null, 2),
                       sinon.stub().yields(null, 3)], callback);

        assert.ok(callback.calledWith(null, [2, 3]));
    },

    "immediately passes error to callback": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields({ message: "Ooops" }),
                       sinon.stub().yields(null, 3)], callback);

        assert.ok(callback.calledWith({ message: "Ooops" }));
    },

    "immediately passes promise rejection to callback": function () {
        var callback = sinon.spy();
        var promise = { then: sinon.stub().callsArgWith(1, { message: "Ooops" }) };
        buster.series([sinon.stub().returns(promise),
                       sinon.stub().yields(null, 3)], callback);

        assert.ok(callback.calledWith({ message: "Ooops" }));
    },

    "does not use promise resolution as error": function () {
        var callback = sinon.spy();
        var promise = { then: sinon.stub().yields({ id: 42 }) };
        var second = sinon.spy();
        buster.series([sinon.stub().returns(promise), second], callback);

        assert.ok(second.calledOnce);
    },

    "collects results from promises and callbacks": function () {
        var callback = sinon.spy();
        var promise = { then: sinon.stub().yields({ id: 42 }) };

        buster.series([sinon.stub().returns(promise),
                       sinon.stub().yields(null, { id: 12 })], callback);

        assert.ok(callback.calledWith(null, [{ id: 42 }, { id: 12 }]));
    },

    "does not call next when function errors": function () {
        var callback = sinon.spy();
        var fns = [sinon.stub().yields({ message: "Ooops" }),
                   sinon.stub().yields(null, 3)];
        buster.series(fns, callback);

        assert.ok(!fns[1].called);
    },

    "only calls callback once": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields({ message: "Ooops" }),
                       sinon.stub().yields({ message: "Nooo!" })], callback);

        assert.ok(callback.calledOnce);
    },

    "does not fail if error and no callback": function () {
        assert.doesNotThrow(function () {
            buster.series([sinon.stub().yields({ message: "Ooops" }),
                           sinon.stub().yields({ message: "Nooo!" })]);
        });
    },

    "only calls callback once with one failing and one passing": function () {
        var callback = sinon.spy();
        buster.series([sinon.stub().yields(null), sinon.stub().yields({})], callback);

        assert.ok(callback.calledOnce);
    }
});
