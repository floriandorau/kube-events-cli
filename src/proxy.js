const { spawn } = require('child_process');

const run = function () {
    const kubectl = spawn('kubectl', ['proxy'], { cwd: undefined, env: process.env });

    return new Promise((resolve, reject) => {
        kubectl.stdout.on('data', (data) => {
            resolve(Buffer.from(data, 'utf8').toString());
        });

        kubectl.stderr.on('data', (data) => {
            reject(data);
        });

        kubectl.on('close', (code) => {
            resolve(null, code);
        });

        kubectl.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = { run }; 