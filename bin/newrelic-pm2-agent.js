var agent = require('./');

if (require.main === module) {
    var program = require('commander');
    program
        .version(pjson.version)
        .usage('[options] <file ...>')
        .option('-l, --license <license>', 'License Key')
        .option('-u, --url <url>', 'Newrelic URL. Default is `https://platform-api.newrelic.com/platform/v1/metrics`.')
        .option('-g, --guid <guid>', 'Guid. Default is `com.newrelic.pm2plugin`.')
        .parse(process.argv);

    if (!program.license) {
        throw new Error('--license is required');
    }

    // polling
    agent.poll({
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
}