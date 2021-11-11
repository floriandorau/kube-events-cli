#!/usr/bin/env node

const yargs = require('yargs');
require('dotenv').config()

const { fetchK8sEvents } = require('../lib');
const { run } = require('../lib/util/proxy');

yargs
    .version()
    .usage('Usage: $0 -x [num]')
    .command(
        'events',
        'Fetch events from cluster',
        function (yargs) {
            return yargs.option('c', {
                alias: 'config',
                describe: 'specify Kube Events config',
                type: 'string',
                nargs: 1,
                demand: true,
                demand: 'config path is required',
                //default: '/etc/passwd'
            })
        },
        function handler(argv) {
            run()
                .then(async () => await fetchK8sEvents({ config: argv.config }))
                .catch((err) => console.error(err));
        })
    .epilog('copyright 2021')
    .showHelpOnFail(false, "Specify --help for available options")
    .alias('h', 'help')
    .help('help')
    .argv;
