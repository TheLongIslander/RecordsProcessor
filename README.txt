Record Processor

Introduction:

The Record Processor is a NodeJS application designed for parsing, validating, and sorting records from text files. Each record, delineated by BEGIN:RECORD and END:RECORD tags, contains properties like IDENTIFIER, TIME, WEIGHT, UNITS, and COLOR. This tool ensures each record meets specific validation criteria, sorts records based on the TIME property, and outputs the sorted records to a new file.

Prerequisites:

Node.js (Version 12.x or higher recommended)


Usage:

To process and sort records from an input text file and save the output to a new file, use the following command:

	node main.js <inputFilePath> <outputFilePath>

*NOTE*: Make sure other dependency files (such fileHandler.js and recordProcessor.js) are in the same working directory as main.js

-"<inputFilePath>": Path to the input text file containing the records.
-"<outputFilePath>": Path where the sorted records will be saved.

Example of what input file's text formatting should look like:

	BEGIN:RECORD
	IDENTIFIER: 12345
	TIME: 20230101T120000
	WEIGHT: 150
	UNITS: kg
	COLOR: red
	END:RECORD

	BEGIN:RECORD
	IDENTIFIER: 12346
	TIME: 20230102T130000
	WEIGHT: 160
	UNITS: kg
	END:RECORD

	BEGIN:RECORD
	IDENTIFIER: 12347
	TIME: 20230103T143000
	COLOR: blue
	END:RECORD

	BEGIN:RECORD
	IDENTIFIER: 12348
	TIME: 20230101T154500
	WEIGHT: 140
	UNITS: lbs
	END:RECORD

	BEGIN:RECORD
	IDENTIFIER: 12349
	TIME: 20230102T160000
	END:RECORD


Features

-Record Parsing: Efficiently parses text files containing records delineated by BEGIN:RECORD and END:RECORD tags. This allows for easy processing of structured data within a plain text format.

-Property Validation: Each record is validated against a set of predefined rules to ensure data integrity. Required properties such as IDENTIFIER and TIME must be present, and conditional properties like UNITS (required if WEIGHT is present) are checked for consistency.

-Flexible Property Handling: Supports optional properties (WEIGHT and COLOR), providing flexibility in record structure without compromising the validation process.
TIME-based Sorting: Records are sorted in ascending order based on the TIME property, ensuring that output is organized chronologically.

-Customizable Output: Processed records are saved to a new file, allowing users to specify the output destination and maintain the original data file untouched.
Robust Error Reporting: Any formatting errors, missing required properties, unknown properties, or missing values are reported, making it easy to diagnose and fix input file issues.

-Automated Testing: Includes a comprehensive Jasmine test suite focusing on edge cases to ensure the reliability and stability of the record processing logic.

-Modular Design: The project is structured into separate modules (fileHandler.js, recordProcessor.js, and main.js), promoting code reusability and maintainability.

-No External Dependencies: The core functionality relies solely on Node.js standard libraries, ensuring simplicity and ease of setup without the need for additional packages.