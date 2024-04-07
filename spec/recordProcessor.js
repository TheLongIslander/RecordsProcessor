// The core logic for parsing and processing records

function parseRecords(fileContent) {
    const records = [];
    const lines = fileContent.split(/\r?\n/);
    let currentRecord = null;
    let inRecord = false;
    const errors = [];  // Initialize an array to collect errors

    lines.forEach(line => {
        const trimmedLine = line.trim().toUpperCase();
        if (trimmedLine === 'BEGIN:RECORD') {
            if (inRecord) {
                errors.push('Nested BEGIN:RECORD found');
                return;
            }
            inRecord = true;
            currentRecord = { properties: {} };
        } else if (trimmedLine === 'END:RECORD') {
            if (!inRecord) {
                errors.push('END:RECORD without BEGIN:RECORD');
                return;
            }
            // Collect errors from validateRecord instead of throwing
            const validationErrors = validateRecord(currentRecord);
            if (validationErrors.length > 0) {
                errors.push(...validationErrors);
                inRecord = false;
                return;
            }
            records.push(currentRecord);
            inRecord = false;
        } else if (inRecord) {
            const [property, value] = line.split(':').map(s => s.trim());
            const propertyName = property.toUpperCase();
            if (!propertyName || value === undefined) {
                errors.push(`Invalid property format in line: ${line}`);
                return;
            }
            if (currentRecord.properties[propertyName]) {
                errors.push(`Duplicate property ${propertyName} in a record`);
                return;
            }
            currentRecord.properties[propertyName] = value;
        }
    });

    if (inRecord) {
        errors.push('File ends with an incomplete record');
    }

    return { records, errors };  // Return both records and errors
}


function validateRecord(record) {
    const errors = [];
    const requiredProperties = ['IDENTIFIER', 'TIME'];
    const conditionalRequired = { 'WEIGHT': 'UNITS' };

    requiredProperties.forEach(prop => {
        if (!record.properties[prop]) {
            errors.push(`Missing required property: ${prop}`);
        }
    });

    Object.keys(conditionalRequired).forEach(key => {
        if (record.properties[key] && !record.properties[conditionalRequired[key]]) {
            errors.push(`Missing required property: ${conditionalRequired[key]} when ${key} is present`);
        }
    });

    if (!/^\d{8}T\d{6}$/.test(record.properties['TIME'])) {
        errors.push(`Invalid TIME format: ${record.properties['TIME']}`);
    } else {
        const year = record.properties['TIME'].substring(0, 4);
        const month = record.properties['TIME'].substring(4, 6);
        const day = record.properties['TIME'].substring(6, 8);
        const hour = record.properties['TIME'].substring(9, 11);
        const minute = record.properties['TIME'].substring(11, 13);
        const second = record.properties['TIME'].substring(13, 15);

        const dateError = isValidDateTimeGroup(year, month, day, hour, minute, second);
        if (dateError) {
            errors.push(dateError);
        }
    }

    return errors;
}



function isValidDateTimeGroup(year, month, day, hour, minute, second) {
    // Convert all components to numbers for proper comparison
    year = parseInt(year, 10);
    month = parseInt(month, 10) - 1; // Adjust for zero-indexed months in JavaScript
    day = parseInt(day, 10);
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    second = parseInt(second, 10);

    const date = new Date(Date.UTC(year, month, day, hour, minute, second));

    // Check for leap years and correct number of days in each month
    if (month === 1) { // February
        const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
        if (day > (isLeapYear ? 29 : 28)) {
            return 'February does not have that many days';
        }
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
        if (day > 30) {
            return 'The day is invalid or does not exist for the given month and year.';
        }
    } else if (day > 31) {
        return 'The day is invalid or does not exist for the given month and year.';
    }

    // Check for valid time ranges
    if (hour > 23) {
        return 'The hour is invalid or out of range (00-23).';
    }
    if (minute > 59) {
        return 'The minute is invalid or out of range (00-59).';
    }
    if (second > 59) {
        return 'The second is invalid or out of range (00-59).';
    }

    // Validate the constructed date against the input components
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month ||
        date.getUTCDate() !== day ||
        date.getUTCHours() !== hour ||
        date.getUTCMinutes() !== minute ||
        date.getUTCSeconds() !== second) {
        return 'The date-time components do not match a valid date.';
    }

    return null; // null indicates the date-time group is valid
}



function sortRecordsByTime(records) {
    return records.sort((a, b) => {
        // Assuming TIME is in 'YYYYMMDDTHHMMSS' format and can be sorted as a string
        return a.properties['TIME'].localeCompare(b.properties['TIME']);
    });
}

function formatRecords(records) {
    return records.map(record => {
        const properties = Object.keys(record.properties).map(key => `${key}: ${record.properties[key]}`).join('\n');
        return `BEGIN:RECORD\n${properties}\nEND:RECORD`;
    }).join('\n\n');
}

module.exports = {
    parseRecords,
    validateRecord,
    sortRecordsByTime,
    formatRecords
};
