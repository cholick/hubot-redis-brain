const Url = require("url");
const Redis = require("redis");

module.exports = function (robot) {
    var redisUrl = 'redis://localhost:6379';
    var redisUrlEnv = undefined;
    ["REDISTOGO_URL", "BOXEN_REDIS_URL", "REDISCLOUD_URL", "REDIS_URL"].forEach(function (potentialEnvValue) {
        if (process.env[potentialEnvValue]) {
            redisUrl = redisUrlEnv = potentialEnvValue;
        }
    });
    if (redisUrlEnv != null) {
        robot.logger.info("hubot-redis-brain: Discovered redis from " + redisUrlEnv + " environment variable");
    } else {
        robot.logger.info("hubot-redis-brain: Using default redis on localhost:6379");
    }

    var client;
    var info = Url.parse(redisUrl, true);
    if (info.auth) {
        client = Redis.createClient(info.port, info.hostname, {
            no_ready_check: true
        });
    } else {
        client = Redis.createClient(info.port, info.hostname);
    }

    var prefix = 'hubot';
    if (info.path) {
        prefix = info.path.replace('/', '')
    }

    robot.brain.setAutoSave(false);

    function getData() {
        return client.get(prefix + ":storage", function (err, reply) {
            if (err) {
                throw err;
            } else if (reply) {
                robot.logger.info("hubot-redis-brain: Data for " + prefix + " brain retrieved from Redis");
                robot.brain.mergeData(JSON.parse(reply.toString()));
            } else {
                robot.logger.info("hubot-redis-brain: Initializing new data for " + prefix + " brain");
                robot.brain.mergeData({});
            }
            return robot.brain.setAutoSave(true);
        });
    }

    if (info.auth) {
        client.auth(info.auth.split(":")[1], function (err) {
            if (err) {
                return robot.logger.error("hubot-redis-brain: Failed to authenticate to Redis");
            } else {
                robot.logger.info("hubot-redis-brain: Successfully authenticated to Redis");
                return getData();
            }
        });
    }

    client.on("error", function (err) {
        if (/ECONNREFUSED/.test(err.message)) {

        } else {
            return robot.logger.error(err.stack);
        }
    });

    client.on("connect", function () {
        robot.logger.debug("hubot-redis-brain: Successfully connected to Redis");
        if (!info.auth) {
            return getData();
        }
    });

    robot.brain.on('save', function (data) {
        if (data == null) {
            data = {};
        }
        return client.set(prefix + ":storage", JSON.stringify(data));
    });

    return robot.brain.on('close', function () {
        return client.quit();
    });
};
