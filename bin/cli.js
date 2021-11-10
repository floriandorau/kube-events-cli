#!/usr/bin/env node

const yargs = require('yargs');
require('dotenv').config()

const { fetchEvents } = require('../lib');
const { run } = require('../lib/proxy');

yargs.command(
    'events',
    'Stream events',
    () => { },
    async function handler() {
        run()
            .then(async () => await fetchEvents())
            .catch((err) => console.error(err));
    }
).argv;
