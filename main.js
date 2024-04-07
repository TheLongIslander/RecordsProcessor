const { readFile, writeFile } = require('./fileHandler');
const { parseRecords, sortRecordsByTime, formatRecords } = require('./recordProcessor');

function processFile(inputFilePath, outputFilePath) {
    const data = readFile(inputFilePath);
    const { records, errors } = parseRecords(data);

    if (errors.length > 0) {
        console.error('Errors processing records:', errors.join('\n'));
        return;  // Stop processing if there are errors
    }

    const sortedRecords = sortRecordsByTime(records);
    const formattedData = formatRecords(sortedRecords);
    writeFile(outputFilePath, formattedData, (error) => {
        if (error) {
            console.error('Error writing to file:', error);
        } else {
            console.log(`Sorted records have been written to ${outputFilePath}`);
        }
    });
}


const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
    console.log('Usage: node main.js <inputFilePath> <outputFilePath>');
    process.exit(1);
}

processFile(inputFilePath, outputFilePath);
