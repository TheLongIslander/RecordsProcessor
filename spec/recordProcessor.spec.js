const {
  parseRecords,
  validateRecord,
  sortRecordsByTime,
  formatRecords
} = require('../recordProcessor');

describe("Record Processor", () => {

  describe("parseRecords", () => {
    it("should correctly parse records from file content", () => {
      const fileContent = `BEGIN:RECORD\nIDENTIFIER: 123\nTIME: 20230101T120000\nEND:RECORD`;
      const { records, errors } = parseRecords(fileContent);
      expect(records.length).toEqual(1);
      expect(records[0].properties.IDENTIFIER).toEqual('123');
      expect(records[0].properties.TIME).toEqual('20230101T120000');
      expect(errors.length).toEqual(0);
    });

    it("should detect and collect errors for records with invalid TIME format", () => {
       const fileContent = `BEGIN:RECORD\nIDENTIFIER: 123\nTIME: invalidTIMEformat\nEND:RECORD`;
  const { records, errors } = parseRecords(fileContent);
  expect(errors.length).toEqual(1);
  expect(errors[0]).toContain('Invalid TIME format');
    });

    it("should detect and collect errors for records with logically invalid TIME values", () => {
      const fileContent = `BEGIN:RECORD\nIDENTIFIER: 123\nTIME: 20230230T120000\nEND:RECORD`;
      const { records, errors } = parseRecords(fileContent);
      expect(errors.length).toEqual(1);
      expect(errors[0]).toContain('February does not have that many days');
    });

    it("should return no records and no errors for empty file content", () => {
      const fileContent = ``;
      const { records, errors } = parseRecords(fileContent);
      expect(records.length).toEqual(0);
      expect(errors.length).toEqual(0);
    });

    it("should parse multiple records and collect errors for invalid ones", () => {
      const fileContent = `BEGIN:RECORD\nIDENTIFIER: 123\nTIME: 20230101T120000\nEND:RECORD
BEGIN:RECORD\nIDENTIFIER: 124\nTIME: invalid\nEND:RECORD`;
      const { records, errors } = parseRecords(fileContent);
      expect(records.length).toEqual(1);
      expect(errors.length).toEqual(1);
      expect(records[0].properties.IDENTIFIER).toEqual('123');
      expect(errors[0]).toContain('Invalid TIME format');
    });
  });

  describe("validateRecord", () => {
    it("should throw an error if a required property is missing", () => {
      const record = { properties: { TIME: '20230101T120000' } };
      const errors = validateRecord(record);
      expect(errors).toContain('Missing required property: IDENTIFIER');
    });

    it("should return an error for invalid TIME format", () => {
      const record = {
        properties: {
          IDENTIFIER: '123',
          TIME: '20230101120000'
        }
      };
      const errors = validateRecord(record);
      expect(errors).toContain('Invalid TIME format: 20230101120000');
    });

    it("should return an error for logically invalid TIME values (e.g., invalid date)", () => {
      const record = {
        properties: {
          IDENTIFIER: '123',
          TIME: '20230230T120000'  // February 30th does not exist
        }
      };
      const errors = validateRecord(record);
      // Adjust this to match the actual error message generated by your code
      expect(errors).toContain('February does not have that many days');
    });

    it("should return an error for logically invalid TIME values (e.g., invalid time)", () => {
      const record = {
        properties: {
          IDENTIFIER: '123',
          TIME: '20230101T250000'
        }
      };
      const errors = validateRecord(record);
      expect(errors).toContain('The hour is invalid or out of range (00-23).');
    });

    it("should not return any errors for a record with all required properties correctly set", () => {
      const record = { properties: { IDENTIFIER: '123', TIME: '20230101T120000' } };
      const errors = validateRecord(record);
      expect(errors.length).toEqual(0);
    });

    it("should not return errors for records with additional properties", () => {
      const record = { properties: { IDENTIFIER: '123', TIME: '20230101T120000', EXTRA: 'value' } };
      const errors = validateRecord(record);
      expect(errors.length).toEqual(0);
    });
  });

  describe("sortRecordsByTime", () => {
    it("should sort records based on the TIME property", () => {
      const records = [
        { properties: { IDENTIFIER: '123', TIME: '20230101T130000' } },
        { properties: { IDENTIFIER: '124', TIME: '20230101T120000' } }
      ];
      const sorted = sortRecordsByTime(records);
      expect(sorted[0].properties.IDENTIFIER).toEqual('124');
      expect(sorted[1].properties.IDENTIFIER).toEqual('123');
    });

    it("should maintain the order of records with identical TIME properties when sorting", () => {
      const records = [
        { properties: { IDENTIFIER: '123', TIME: '20230101T120000' } },
        { properties: { IDENTIFIER: '124', TIME: '20230101T120000' } }
      ];
      const sorted = sortRecordsByTime(records);
      expect(sorted[0].properties.IDENTIFIER).toEqual('123');
      expect(sorted[1].properties.IDENTIFIER).toEqual('124');
    });

    it("should correctly sort records ignoring those with invalid TIME formats", () => {
      const records = [
        { properties: { IDENTIFIER: '123', TIME: 'invalid' } },
        { properties: { IDENTIFIER: '124', TIME: '20230101T110000' } }
      ];
      const sorted = sortRecordsByTime(records);
      expect(sorted[0].properties.IDENTIFIER).toEqual('124');
    });
  });

  describe("formatRecords", () => {
    it("should format records into a string", () => {
      const records = [
        { properties: { IDENTIFIER: '123', TIME: '20230101T120000' } }
      ];
      const formatted = formatRecords(records);
      expect(formatted).toContain('BEGIN:RECORD');
      expect(formatted).toContain('END:RECORD');
      expect(formatted).toContain('IDENTIFIER: 123');
      expect(formatted).toContain('TIME: 20230101T120000');
    });

    it("should correctly format multiple records into a string", () => {
      const records = [
        { properties: { IDENTIFIER: '123', TIME: '20230101T120000' } },
        { properties: { IDENTIFIER: '124', TIME: '20230102T120000' } }
      ];
      const formatted = formatRecords(records);
      expect(formatted).toMatch(/BEGIN:RECORD[\s\S]*END:RECORD/g);
      expect(formatted).toContain('IDENTIFIER: 123');
      expect(formatted).toContain('IDENTIFIER: 124');
      expect(formatted.match(/BEGIN:RECORD/g || []).length).toEqual(2);
    });

    it("should return an empty string when there are no records to format", () => {
      const records = [];
      const formatted = formatRecords(records);
      expect(formatted).toEqual('');
    });
  });

});
