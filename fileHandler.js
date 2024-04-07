const fs = require('fs');

// Handles reading and writing files

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, data, callback) {
    fs.writeFile(filePath, data, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            callback(err);
        } else {
            console.log(`File has been written successfully to ${filePath}.`);
            callback(null);
        }
    });
}

module.exports = {
    readFile,
    writeFile
};
