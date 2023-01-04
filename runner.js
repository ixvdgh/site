const http = require('http');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function sysInfo() {
    let out = {};
    try {
        out['uname'] = child_process.execSync('uname -a').toString().trim();
        out['uptime'] = child_process.execSync('uptime').toString().trim();
        out['hostname'] = child_process.execSync('hostname').toString().trim();
        out['whoami'] = child_process.execSync('whoami').toString().trim();
    } catch (e) {
        out['error'] = e;
    }
    return out;
}

let doingUpdate = false;
let routes = {
    '/@update': async (req, res) => {
        if (doingUpdate) return res.end('Already updating');
        console.log('UPDATE');
        doingUpdate = true;
        let cmds = [
            'cd /app',
            'git log -1',
            'git pull',
            'npm install',
            'npm run compile'
        ];
        for (let cmd of cmds) {
            try {
                res.write('$ ' + cmd);
                res.write(child_process.execSync(cmd).toString() + '\n');
                res.write('# OK');
            } catch (e) {
                console.log(e);
                res.writeHead(500);
                res.end('FAIL');
                doingUpdate = false;
                return;
            }
        }
        res.end('OK');
        doingUpdate = false;
    },
    '/sysinfo': (req, res) => {
        res.end(JSON.stringify(sysInfo(), null, 4));
    },
    '*': (req, res) => {
        if (req.url === '/') {
            req.url = '/index.html';
        }
        let p = path.join(__dirname, 'dist', req.url);
        if (fs.existsSync(p)) {
            res.writeHead(200);
            res.end(fs.readFileSync(p));
        } else {
            res.writeHead(404);
            res.write(`404: ${req.url}`);
            res.end();
        }
    }
}

function server() {
    http.createServer(async (req, res) => {
        console.log('INC: [' + req.method + '] ' + req.url);
        if (routes[req.url]) {
            await routes[req.url](req, res);
        } else {
            await routes['*'](req, res);
        }
        console.log('OUT: [' + res.statusCode + '] ' + req.url);
    }).listen(process.env.PORT || 80, () => {
        console.log('Server started');
    });
}

// restart server on crash
function restart() {
    try {
        server();
    } catch (e) {
        console.log(e);
        restart();
    }
}

restart();
