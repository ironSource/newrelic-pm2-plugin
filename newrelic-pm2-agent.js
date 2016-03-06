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

    if (!opts.license)
        throw new Error('--license required');

    // defaults
    opts = _.defaults(opts, {
        interval: 60000,                // every 1 min
        license: program.license,
        url: program.url || "https://platform-api.newrelic.com/platform/v1/metrics",
        guid: program.guid || "com.newrelic.pm2plugin"
    });

    // Connect or launch pm2
    pm2.connect(function (err) {

        if (err) {
            return cb(err);
        }

        console.log('Just connected to PM2');

        // Pull down the list
        pm2.list(function (err, list) {

            if (err) {
                return cb(err);
            }

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
                metrics['Component/pm2[uptime]'] = Math.floor((new Date() - l.pm2_env.pm_uptime) / 1000);   // seconds
                metrics['Component/pm2[restarts]'] = l.pm2_env.restart_time;
                metrics['Component/pm2[cpu]'] = l.monit.cpu;
                metrics['Component/pm2[memory]'] = l.monit.memory;

                var cmp = {};
                cmp['name'] = name;
                cmp['guid'] = guid;
                cmp['duration'] = 60;
                cmp['metrics'] = metrics;
                cmps.push(cmp);
            });

            msg.components = cmps;
            request({
                url: url,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-License-Key': opts.license
                },
                body: JSON.stringify(msg)
            }, function (err, httpResponse) {
                if (err) return cb(err);
                console.log('New Relic Reponse: %d', httpResponse.statusCode);
                cb();
            });
        });
    });

    // Re-run
    setTimeout(poll, opts.interval);
}


if (require.main === module) {

    var program = require('commander');
    program
        .version(pjson.version)
        .usage('[options] <file ...>')
        .option('-l, --license <license>', 'License Key')
        .option('-u, --url <url>', 'Newrelic URL. Default is `https://platform-api.newrelic.com/platform/v1/metrics`.')
        .option('-g, --guid <guid>', 'Guid. Default is `com.newrelic.pm2plugin`.')
        .parse(process.argv);

    if (!program.license)
        throw new Error('--license required');

    // polling
    poll({
        interval: 60000,
        license: program.license,
        url: program.url,
        guid: program.guid
    }, function (err) {
        if (err) {
            console.error('-E', err);
            process.exit(1);
        }
    });

} else {
    module.exports = poll;
}