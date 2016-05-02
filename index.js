const fs = require('fs');
const path = require('path');

module.exports = function (robot, scripts) {
    var scriptsPath = path.resolve(__dirname, 'src');
    fs.exists(scriptsPath, function (exists) {
        if (exists) {
            fs.readdirSync(scriptsPath).forEach(function (script) {
                robot.loadFile(scriptsPath, script);
            });
        }
    });
};
