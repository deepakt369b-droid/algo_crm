const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const directoriesToSkip = ['.git', 'node_modules', '.next', 'test-results', 'playwright-report', 'public'];
const filesToSkip = ['pnpm-lock.yaml', 'tsconfig.tsbuildinfo'];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!directoriesToSkip.includes(file)) {
                processDirectory(fullPath);
            }
        } else {
            if (!filesToSkip.includes(file) && !file.match(/\.(png|jpg|jpeg|gif|ico|svg|pdf|tsbuildinfo|lock)$/i)) {
                processFile(fullPath);
            }
        }
    }
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Replace exact cases
        content = content.replace(/Flowline Pro/g, 'Flowline Pro');
        content = content.replace(/Flowline Pro/g, 'Flowline Pro');
        content = content.replace(/flowlinepro/g, 'flowlinepro'); // mostly for urls/ids/lowercase
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath.replace(projectRoot, '')}`);
        }
    } catch (e) {
        // Ignore files that are not utf8
    }
}

processDirectory(projectRoot);
console.log("Renaming complete.");
