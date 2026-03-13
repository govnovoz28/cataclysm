const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'utils', 'lib', 'hooks', 'types', 'constants'];
const rootFiles = ['tailwind.config.ts', 'middleware.ts', 'next.config.ts', 'package.json'];
const outputFile = 'PROJECT-CODE.txt';
const ignoreDirs = ['node_modules', '.next', '.git', 'dist'];

let outputContent = '';
let fileCount = 0;

function readFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoreDirs.includes(file)) readFiles(fullPath);
        } else if (file.match(/\.(ts|tsx|css|js|mjs)$/)) {
            if (file.includes('.min.') || file.includes('.generated.')) continue;
            outputContent += `\n\n// ==========================================\n// ${fullPath}\n// ==========================================\n`;
            outputContent += fs.readFileSync(fullPath, 'utf-8');
            fileCount++;
        }
    }
}

targetDirs.forEach(dir => readFiles(dir));

rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
        outputContent += `\n\n// ==========================================\n// ${file}\n// ==========================================\n`;
        outputContent += fs.readFileSync(file, 'utf-8');
        fileCount++;
    }
});

fs.writeFileSync(outputFile, outputContent);

const lines = outputContent.split('\n').length;
console.log(`✅`);
console.log(`📁 Файлов: ${fileCount}`);