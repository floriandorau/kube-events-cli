#!/usr/bin/env node

const yargs = require("yargs");
require('dotenv').config()

const { fetchEvents } = require("../lib");
const { run } = require("../lib/proxy");

yargs.command(
  "events",
  "Stream events",
  () => {
    console.log("foo");
  },
  async function handler(argv) {
    console.log("Run events command");
    run()
      .then(async (data) => {
        console.log('dta', data);
        const events = await fetchEvents();
      })
      .catch((err) => console.error(err));
  }
).argv;
