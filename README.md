# newrelic-pm2-agent


## Overview

Plugin to pull data from PM2 and publish to New Relic.

## Quick Start

#### Installation

```sh
npm install https://github.com/ironSource/newrelic-pm2-plugin
```

#### Via Command line

```sh

$ node node_modules/newrelic-pm2-plugin/bin/newrelic-pm2-agent.js --help

  Usage: newrelic-pm2-agent [options] <file ...>

  Options:

    -h, --help               Usage
    -V, --version            Version
    -l, --license <license>  License Key
    -u, --url <url>          Newrelic URL. Default is `https://platform-api.newrelic.com/platform/v1/metrics`.
    -g, --guid <guid>        Guid. Default is `com.newrelic.pm2plugin`.


$ node node_modules/newrelic-pm2-plugin/bin/newrelic-pm2-agent.js --license <LICENSE_KEY>
```

#### Newrelic.js bootstrap

Add this snippet to your `newrelic.js` in order to bootstrap the PM2 agent.

```javascript
require('newrelic-pm2-plugin')({
    license: module.exports.config.license_key,
    interval: 60000
}, function(err) {
    // do something with the error
});
```