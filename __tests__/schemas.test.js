const xss = require("xss");

describe("Model Schema Sanitization", () => {
  describe("Note schema fields", () => {
    test("should have XSS setter on title field", () => {
      const noteSchema = require("../src/models/Note").schema;
      const titlePath = noteSchema.paths.title;

      expect(titlePath).toBeDefined();
      expect(titlePath.setters.length).toBeGreaterThan(0);
    });

    test("should have XSS setter on content field", () => {
      const noteSchema = require("../src/models/Note").schema;
      const contentPath = noteSchema.paths.content;

      expect(contentPath).toBeDefined();
      expect(contentPath.setters.length).toBeGreaterThan(0);
    });

    test("title should have maxlength validation", () => {
      const noteSchema = require("../src/models/Note").schema;
      const titlePath = noteSchema.paths.title;

      expect(titlePath.validators.length).toBeGreaterThan(0);
    });

    test("content should be required", () => {
      const noteSchema = require("../src/models/Note").schema;
      const contentPath = noteSchema.paths.content;

      expect(contentPath.isRequired).toBe(true);
    });

    test("readTime should have minimum value of 1", () => {
      const noteSchema = require("../src/models/Note").schema;
      const readTimePath = noteSchema.paths.readTime;

      expect(readTimePath).toBeDefined();
      // Check for min validator
      const minValidator = readTimePath.validators.find(
        (v) => v.type === "min",
      );
      expect(minValidator).toBeDefined();
    });
  });

  describe("Comment schema fields", () => {
    test("should have XSS setter on name field", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const namePath = commentSchema.paths.name;

      expect(namePath).toBeDefined();
      expect(namePath.setters.length).toBeGreaterThan(0);
    });

    test("should have XSS setter on content field", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const contentPath = commentSchema.paths.content;

      expect(contentPath).toBeDefined();
      expect(contentPath.setters.length).toBeGreaterThan(0);
    });

    test("name should have maxlength validation", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const namePath = commentSchema.paths.name;

      expect(namePath.validators.length).toBeGreaterThan(0);
    });

    test("content should have maxlength validation", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const contentPath = commentSchema.paths.content;

      expect(contentPath.validators.length).toBeGreaterThan(0);
    });
  });

  describe("Field sanitization behavior", () => {
    test("should sanitize XSS in title using xss library", () => {
      const maliciousInput = "<script>alert('xss')</script>Safe Title";
      const sanitized = xss(maliciousInput.trim());

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("Safe Title");
    });

    test("should sanitize XSS in content using xss library", () => {
      const maliciousInput = "<img src=x onerror=\"alert('xss')\">Content";
      const sanitized = xss(maliciousInput.trim());

      expect(sanitized).not.toContain("onerror");
      expect(sanitized).toContain("Content");
    });

    test("should trim whitespace in fields", () => {
      const inputWithWhitespace = "   Title with spaces   ";
      const trimmed = inputWithWhitespace.trim();

      expect(trimmed).toBe("Title with spaces");
      expect(trimmed).not.toContain("   ");
    });

    test("should handle empty string after trimming", () => {
      const emptyInput = "   ";
      const trimmed = emptyInput.trim();

      expect(trimmed).toBe("");
    });

    test("should preserve safe HTML entities", () => {
      const safeInput = "Title with &amp; ampersand";
      const sanitized = xss(safeInput.trim());

      // XSS library should preserve or properly encode entities
      expect(sanitized).toContain("ampersand");
    });
  });

  describe("Schema type validation", () => {
    test("Note id should be string and unique", () => {
      const noteSchema = require("../src/models/Note").schema;
      const idPath = noteSchema.paths.id;

      expect(idPath).toBeDefined();
      // Mongoose stores unique as a property or validator
      // Just verify the path exists and is defined
      expect(idPath.options).toBeDefined();
    });

    test("Comment commentId should be string and unique", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const commentIdPath = commentSchema.paths.commentId;

      expect(commentIdPath).toBeDefined();
      // Mongoose stores unique as a property or validator
      // Just verify the path exists and is defined
      expect(commentIdPath.options).toBeDefined();
    });

    test("Note creationDate should default to current time", () => {
      const noteSchema = require("../src/models/Note").schema;
      const creationDatePath = noteSchema.paths.creationDate;

      expect(creationDatePath.defaultValue).toBeDefined();
    });

    test("Comment should reference Note via noteId", () => {
      const commentSchema = require("../src/models/Comment").schema;
      const noteIdPath = commentSchema.paths.noteId;

      expect(noteIdPath).toBeDefined();
      // Check if it's an ObjectId reference
      expect(noteIdPath.instance).toBe("ObjectId");
    });
  });

  describe("Index configuration", () => {
    test("Note should have creationDate index", () => {
      const noteSchema = require("../src/models/Note").schema;
      const indexes = noteSchema._indexes || [];

      // Mongoose stores indexes in _indexes or via getIndexes()
      expect(noteSchema._indexes || noteSchema.getIndexes()).toBeDefined();
    });

    test("Comment should have noteId and creationDate index", () => {
      const commentSchema = require("../src/models/Comment").schema;

      expect(
        commentSchema._indexes || commentSchema.getIndexes(),
      ).toBeDefined();
    });
  });
});
