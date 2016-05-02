const chai = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const assert = chai.assert;

describe.only("redis-brain", function () {
    var robot;
    var encryptStub;
    var decryptStub;
    var createClientStub;
    var fakeClient;
    var brainHandlers = {};
    var clientHandlers = {};

    beforeEach(function () {
        robot = {
            respond: sinon.spy(),
            hear: sinon.spy(),
            brain: {
                setAutoSave: sinon.stub(),
                mergeData: sinon.stub(),
                on: function (event, handler) {
                    brainHandlers[event] = handler;
                }
            },
            logger: {
                info: sinon.stub(),
                error: sinon.stub()
            }
        };
        process.env["REDIS_CRYPT"] = "monkey123";

        encryptStub = sinon.stub();
        decryptStub = sinon.stub();
        createClientStub = sinon.stub();

        fakeClient = {
            set: sinon.stub(),
            get: sinon.stub(),
            on: function (event, handler) {
                clientHandlers[event] = handler;
            }
        };
        createClientStub.returns(fakeClient);

        proxyquire("../src/redis-brain", {
            "./support/crypt": {
                encrypt: encryptStub,
                decrypt: decryptStub
            },
            redis: {
                createClient: createClientStub
            }
        })(robot);
    });

    it("sets auto save to false", function () {
        assert.equal(robot.brain.setAutoSave.callCount, 1);
        assert.ok(robot.brain.setAutoSave.calledWith(false));
    });

    it("throws when no key", function () {
        delete process.env["REDIS_CRYPT"];

        assert.throws(function () {
            require("../src/redis-brain")(robot);
        });
    });

    it("registers handlers", function () {
        assert.ok(brainHandlers.save);
        assert.ok(brainHandlers.close);
    });

    it("encrypts on save", function () {
        encryptStub.returns("ciphertext");

        brainHandlers.save({foo: "bar"});

        assert.equal(encryptStub.callCount, 1);
        assert.equal(encryptStub.args[0][0], '{"foo":"bar"}');
        assert.equal(fakeClient.set.callCount, 1);
        assert.equal(fakeClient.set.args[0][0], "hubot:storage");
        assert.equal(fakeClient.set.args[0][1], "ciphertext");
    });

    it("decrypts on load", function () {
        decryptStub.returns('{"foo":"bar"}');

        clientHandlers.connect();

        assert.equal(fakeClient.get.callCount, 1);
        assert.equal(fakeClient.get.args[0][0], "hubot:storage");

        assert.equal(decryptStub.callCount, 0);
        assert.equal(robot.brain.mergeData.callCount, 0);

        fakeClient.get.args[0][1](undefined, "ciphertext");

        assert.equal(decryptStub.callCount, 1);
        assert.equal(robot.brain.mergeData.callCount, 1);
        assert.deepEqual(robot.brain.mergeData.args[0][0], {
            foo: "bar"
        });
    });
});
