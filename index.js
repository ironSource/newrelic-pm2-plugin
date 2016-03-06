var _ = require('lodash');
var pm2 = require('pm2');
var os = require('os');
var request = require('request');
var pjson = require('./package.json');

/**
 * Start polling.
 * @param opts: options.
 */
function poll(opts, cb) {

    if (!opts.license) {
        return cb(new Error('expected options object to have a `license_key` property, got nothing.'));
    }

    // defaults
    opts = _.defaults(opts, {
        interval: 60000,
        url: "https://platform-api.newrelic.com/platform/v1/metrics",
        guid: "com.newrelic.pm2plugin"
    });

    // Connect or launch pm2
    pm2.connect(function (err) {

        if (err) return cb(err);
        console.log('Just connected to PM2');

        // Pull down the list
        pm2.list(function (err, list) {
            if (err) return cb(err);

            // Start an output message
            var agent = {};
            agent.host = os.hostname();
            agent.pid = process.pid;
            agent.version = pjson.version;

            var msg = {};
            msg.agent = agent;

            // Get the components
            var cmps = [];

            // Pull down data for each function
            list.forEach(function (l) {

                // Basic information
                var name = l.pm2_env.name;
                var metrics = {};
                var cmp = {};

                metrics['Component/pm2[uptime]'] = Math.floor((new Date() - l.pm2_env.pm_uptime) / 1000);   // seconds
                metrics['Component/pm2[restarts]'] = l.pm2_env.restart_time;
                metrics['Component/pm2[cpu]'] = l.monit.cpu;
                metrics['Component/pm2[memory]'] = l.monit.memory;

                cmp['name'] = name;
                cmp['guid'] = opts.guid;
                cmp['duration'] = opts.interval / 1000;
                cmp['metrics'] = metrics;
                cmps.push(cmp);
            });

            msg.components = cmps;
            if (msg.components.length) {
                request({
                    url: opts.url,
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-License-Key': opts.license
                    },
                    body: JSON.stringify(msg)
                }, function (err, httpResponse) {
                    if (err) return cb(err);
                    console.log('New Relic Response: %d', httpResponse.statusCode);
                    cb();
                });
            } else {
                cb();
            }
        });
    });

    // Re-run
    setTimeout(poll, opts.interval);
}


// exports
module.exports = {
    poll: poll
};