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

let routes = {
    '/do_update': (req, res) => {
        console.log('UPDATE');
        let cmds = [
            'git pull',
            'npm install',
            'npm run compile ' + process.env.SERVER_TYPE || 'prod',
        ];
        cmds.forEach(cmd => {
            try {
                // res.write(child_process.execSync(cmd).toString() + '\n');
                let time_start = Date.now();
                child_process.execSync(cmd);
                let time_end = Date.now();
                res.write(`CMD: ${cmd} (${time_end - time_start}ms)\n`);
            } catch (e) {
                console.log(e);
                res.writeHead(500);
                res.end('FAIL');
            }
        })
        res.end('OK');
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

http.createServer((req, res) => {
    console.log('INC: [' + req.method + '] ' + req.url);
    if (routes[req.url]) {
        routes[req.url](req, res);
    } else {
        routes['*'](req, res);
    }
    console.log('OUT: [' + res.statusCode + '] ' + req.url);
}).listen(process.env.PORT || 80, () => {
    console.log('Server started');
});
