// Description:
//  Store data in Redis

const url = require("url");
const redis = require("redis");
const crypt = require("./support/crypt");

module.exports = function (robot) {
    const key = process.env["REDIS_CRYPT"];
    if (!key) {
        var error = "Symmetric key is expected in variable `REDIS_CRYPT`";
        robot.logger.error(error);
        throw error;
    }

    var redisUrl = "redis://localhost:6379";
    var redisUrlEnv = undefined;
    ["REDISTOGO_URL", "BOXEN_REDIS_URL", "REDISCLOUD_URL", "REDIS_URL"].forEach(function (potentialEnvValue) {
        if (process.env[potentialEnvValue]) {
            redisUrlEnv = process.env[potentialEnvValue];
            redisUrl = redisUrlEnv;
        }
    });
    if (redisUrlEnv != null) {
        robot.logger.info("hubot-redis-brain: Discovered redis from " + redisUrlEnv + " environment variable");
    } else {
        robot.logger.info("hubot-redis-brain: Using default redis on localhost:6379");
    }

    var client;
    var info = url.parse(redisUrl, true);
    if (info.auth) {
        client = redis.createClient(info.port, info.hostname, {
            no_ready_check: true
        });
    } else {
        client = redis.createClient(info.port, info.hostname);
    }

    var prefix = "hubot";
    if (info.path) {
        prefix = info.path.replace("/", "");
    }

    robot.brain.setAutoSave(false);

    function getData() {
        client.get(prefix + ":storage", function (err, reply) {
            if (err) {
                throw err;
            } else if (reply) {
                var data = JSON.parse(crypt.decrypt(reply.toString(), key));

                robot.logger.info("hubot-redis-brain: Data for " + prefix + " brain retrieved from Redis");
                robot.brain.mergeData(data);
            } else {
                robot.logger.info("hubot-redis-brain: Initializing new data for " + prefix + " brain");
                robot.brain.mergeData({});
            }
            robot.brain.setAutoSave(true);
        });
    }

    if (info.auth) {
        client.auth(info.auth.split(":")[1], function (err) {
            if (err) {
                robot.logger.error("hubot-redis-brain: Failed to authenticate to Redis");
            } else {
                robot.logger.info("hubot-redis-brain: Successfully authenticated to Redis");
            }
        });
    }

    client.on("error", function (err) {
        robot.logger.error(err);
    });

    client.on("connect", function () {
        robot.logger.info("hubot-redis-brain: Successfully connected to Redis");
        if (!info.auth) {
            getData();
        }
    });

    robot.brain.on("save", function (data) {
        if (data == null) {
            data = {};
        }

        var encrypted = crypt.encrypt(JSON.stringify(data), key);
        client.set(prefix + ":storage", encrypted);
    });

    robot.brain.on("close", function () {
        client.quit();
    });
};
