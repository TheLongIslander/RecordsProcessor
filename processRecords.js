const fs = require('fs');

// Parses the file content to extract records, validates them, and returns an array of record objects
function parseRecords(fileContent) {
    const records = [];
    const lines = fileContent.split(/\r?\n/);
    let currentRecord = null;
    let inRecord = false;

    lines.forEach(line => {
        const trimmedLine = line.trim().toUpperCase();
        if (trimmedLine === 'BEGIN:RECORD') {
            if (inRecord) throw new Error('Nested BEGIN:RECORD found');
            inRecord = true;
            currentRecord = { properties: {} };
        } else if (trimmedLine === 'END:RECORD') {
            if (!inRecord) throw new Error('END:RECORD without BEGIN:RECORD');
            validateRecord(currentRecord);
            records.push(currentRecord);
            inRecord = false;
        } else if (inRecord) {
            const [property, value] = line.split(':').map(s => s.trim());
            const propertyName = property.toUpperCase();
            if (!propertyName || value === undefined) throw new Error(`Invalid property format in line: ${line}`);
            if (currentRecord.properties[propertyName]) throw new Error(`Duplicate property ${propertyName} in a record`);
            currentRecord.properties[propertyName] = value;
        }
    });

    if (inRecord) throw new Error('File ends with an incomplete record');

    return records;
}

// Validates a single record for required properties and rules
function validateRecord(record) {
    const requiredProperties = ['IDENTIFIER', 'TIME'];
    const conditionalRequired = { 'WEIGHT': 'UNITS' };

    requiredProperties.forEach(prop => {
        if (!record.properties[prop]) throw new Error(`Missing required property: ${prop}`);
    });

    Object.keys(conditionalRequired).forEach(key => {
        if (record.properties[key] && !record.properties[conditionalRequired[key]]) {
            throw new Error(`Missing required property: ${conditionalRequired[key]} when ${key} is present`);
        }
    });

    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(record.properties['TIME'])) {
        throw new Error(`Invalid TIME format: ${record.properties['TIME']}`);
    }
}

// Sorts the array of record objects by their TIME property
function sortRecordsByTime(records) {
    return records.sort((a, b) => {
        const timeA = new Date(a.properties['TIME']);
        const timeB = new Date(b.properties['TIME']);
        return timeA - timeB;
    });
}

// Formats the sorted records into a string for output
function formatRecords(records) {
    return records.map(record => {
        const properties = Object.keys(record.properties).map(key => `${key}: ${record.properties[key]}`).join('\n');
        return `BEGIN:RECORD\n${properties}\nEND:RECORD`;
    }).join('\n\n');
}

// Writes the formatted records to the specified output file
function writeToFile(filePath, data) {
    fs.writeFile(filePath, data, 'utf8', err => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('File has been written successfully.');
        }
    });
}

// Main function to process the file
function processFile(inputFilePath, outputFilePath) {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const records = parseRecords(data);
            const sortedRecords = sortRecordsByTime(records);
            const formattedData = formatRecords(sortedRecords);
            writeToFile(outputFilePath, formattedData);
        } catch (error) {
            console.error('Error processing records:', error);
        }
    });
}

// Handling command line arguments for file paths
const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
    console.log('Usage: node processRecords.js <inputFilePath> <outputFilePath>');
    process.exit(1);
}

processFile(inputFilePath, outputFilePath);
