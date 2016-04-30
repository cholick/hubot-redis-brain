chai = require 'chai'
sinon = require 'sinon'

assert = chai.assert

describe 'redis-brain', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()
      brain:
        setAutoSave: sinon.spy()
        on: sinon.spy()
      logger:
        info: sinon.stub()

    require('../src/redis-brain')(@robot)

  it 'sets auto save to false', ->
    assert.equal(@robot.brain.setAutoSave.callCount, 1)
    assert.ok(@robot.brain.setAutoSave.calledWith(false))

