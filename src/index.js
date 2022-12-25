const Handlebars = require('handlebars');
const fs = require("fs");
const child_process = require("child_process");
const cfg = require('./config.json');
const path = require("path");

function getAllTemplates(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(file => file.endsWith('.hbs'));
}

Handlebars.registerHelper('get_latest_commit', function () {
    try {
        return child_process.execSync('git rev-parse HEAD').toString().trim();
    } catch (e) {
        return 'unknown';
    }
});

let assets = [];
Handlebars.registerHelper('asset', function (p) {
    let full_p = path.join(cfg.base_url, 'public', p);
    assets.push({
        path: full_p,
        type: p.split('.').pop()
    });
});

Handlebars.registerHelper('assets', function () {
    let html = '';
    assets.forEach(asset => {
        if (asset.type === 'css') {
            html += `<link rel="stylesheet" href="${asset.path}">`;
        } else if (asset.type === 'js') {
            html += `<script src="${asset.path}"></script>`;
        }
    });
    return html;
});

Handlebars.registerHelper('include', function (p, options) {
    p = path.join(__dirname, 'views/', p);
    let d = {
        ...cfg,
        ...options.hash
    }
    return Handlebars.compile(fs.readFileSync(p).toString())(d);
});

function compileTemplates() {
    const templates = getAllTemplates('views/pages');
    templates.forEach(template => {
        const data = fs.readFileSync(`views/pages/${template}`, 'utf8');
        const compiled = Handlebars.compile(data);
        const html = compiled(cfg);
        fs.writeFileSync(`${cfg.output_dir || 'dist'}/${template.replace('.hbs', '.html')}`, html);
    });
}

function rCopy(src, dest) {
    if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(file => {
            rCopy(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

if (process.argv[2] === 'dev') {
    cfg.base_url = './'; // for dev, we don't want a base url
}

fs.mkdirSync(cfg.output_dir || 'dist', {recursive: true});
compileTemplates();
rCopy('public', `${cfg.output_dir || 'dist'}/public`);
