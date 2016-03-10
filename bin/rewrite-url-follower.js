#!/usr/bin/env node

var RewriteUrlFollower = require('../')

require('yargs')
  .usage('$0 <cmd>')
  .command(
    'rewrite',
    'rewrite the URLs for all packages in couchdb',
    function (yargs) {
      return yargs
        .option('rewrite', {
          alias: 'r',
          describe: 'what URL should packages be rewritten to?',
          default: 'http://127.0.0.1:8080'
        })
        .option('host', {
          alias: 'o',
          describe: 'couchdb host',
          default: '172.17.0.1'
        })
        .option('port', {
          alias: 'p',
          describe: 'couchdb port',
          default: '5984'
        })
        .option('scheme', {
          alias: 's',
          describe: 'couchdb scheme',
          default: 'http'
        })
        .option('user', {
          alias: 'u',
          describe: 'couchdb user',
          default: 'admin'
        })
        .option('pass', {
          alias: 'a',
          describe: 'couchdb password',
          default: 'admin'
        })
        .option('seq-file', {
          describe: 'track how far we have written, so that process can be restarted',
          default: './rewrite.seq'
        })
    },
    function (argv) {
      var r = new RewriteUrlFollower(argv)
      r.start()
    }
  )
  .help()
  .alias('h', 'help')
  .demand(1)
  .strict()
  .example('rewrite URL to http://10.19.99.196:8080 for couchdb at 172.17.0.1:5984', '$0 rewrite --rewrite=http://10.19.99.196:8080 --host=172.17.0.1 --port=5984')
  .argv
