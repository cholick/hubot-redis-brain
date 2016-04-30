const chai = require("chai");
const sinon = require("sinon");

const assert = chai.assert;

describe("redis-brain", function () {
    var robot;

    beforeEach(function () {
        robot = {
            respond: sinon.spy(),
            hear: sinon.spy(),
            brain: {
                setAutoSave: sinon.spy(),
                on: sinon.spy()
            },
            logger: {
                info: sinon.stub()
            }
        };
        require("../src/redis-brain")(robot);
    });

    it("sets auto save to false", function () {
        assert.equal(robot.brain.setAutoSave.callCount, 1);
        assert.ok(robot.brain.setAutoSave.calledWith(false));
    });

    it("", function () {

    });
});
