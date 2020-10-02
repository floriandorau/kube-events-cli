#!/usr/bin/env node

const yargs = require('yargs');

const { fetchEvents } = require('../src/k8s');
const { run } = require('../src/proxy');

yargs.command(
    'events',
    'Stream events',
    () => { console.log('foo') },
    async function handler(argv) {
        console.log('Run events command')
        run().then(async (data) => {
            console.log(data);
            const events = await fetchEvents();
            console.log(events);
        }).catch(err => console.error(err));
    }).argv;