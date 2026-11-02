const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Use archiver or built-in zip via adm-zip or simple powershell script without special chars
fs.copyFileSync(path.join(__dirname, '../public/panel.html'), path.join(__dirname, '../panel.html'));
console.log('Copied panel.html to root');

