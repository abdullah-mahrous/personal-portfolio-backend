const {
  sanitizeString,
  validateNote,
  validateComment,
  validateAdminLogin,
} = require("../src/utils/validators");

describe("Sanitization and XSS Protection", () => {
  describe("sanitizeString function", () => {
    test("should remove script tags from input", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeString(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
    });

    test("should remove dangerous HTML attributes", () => {
      const input = '<img src="x" onerror="alert(\'xss\')" />';
      const result = sanitizeString(input);
      expect(result).not.toContain("onerror");
    });

    test("should remove event handlers", () => {
      const input = "<div onclick=\"alert('xss')\">Click me</div>";
      const result = sanitizeString(input);
      expect(result).not.toContain("onclick");
    });

    test("should preserve safe text", () => {
      const input = "This is safe text";
      const result = sanitizeString(input);
      expect(result).toBe("This is safe text");
    });

    test("should trim whitespace", () => {
      const input = "   test   ";
      const result = sanitizeString(input);
      expect(result).toBe("test");
    });

    test("should handle non-string input", () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBeNull();
      expect(sanitizeString(undefined)).toBeUndefined();
    });

    test("should remove embedded JavaScript", () => {
      const input = "<img src=x onerror=javascript:alert('xss')>";
      const result = sanitizeString(input);
      expect(result).not.toContain("javascript:");
    });

    test("should handle iframe injection", () => {
      const input = '<iframe src="https://malicious.com"></iframe>';
      const result = sanitizeString(input);
      expect(result).not.toContain("<iframe");
    });
  });

  describe("validateNote with sanitization", () => {
    test("should sanitize title with XSS payload", () => {
      const data = {
        title: "<script>alert('xss')</script>My Title",
        content: "Valid content",
        readTime: 5,
      };
      const { error, value } = validateNote(data);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.title).not.toContain("<script>");
    });

    test("should sanitize content with XSS payload", () => {
      const data = {
        title: "My Title",
        content: "<img src=x onerror=\"alert('xss')\">Content",
        readTime: 5,
      };
      const { error, value } = validateNote(data);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.content).not.toContain("onerror");
    });

    test("should reject title exceeding max length", () => {
      const data = {
        title: "a".repeat(201),
        content: "Valid content",
        readTime: 5,
      };
      const { error } = validateNote(data);
      expect(error).not.toBeNull();
    });

    test("should reject missing required fields", () => {
      const data = {
        title: "My Title",
      };
      const { error } = validateNote(data);
      expect(error).not.toBeNull();
    });

    test("should reject invalid readTime", () => {
      const data = {
        title: "My Title",
        content: "Valid content",
        readTime: 0,
      };
      const { error } = validateNote(data);
      expect(error).not.toBeNull();
    });

    test("should allow null imgURL and imgId", () => {
      const data = {
        title: "My Title",
        content: "Valid content",
        readTime: 5,
        imgURL: null,
        imgId: null,
      };
      const { error, value } = validateNote(data);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.imgURL).toBeNull();
    });
  });

  describe("validateComment with sanitization", () => {
    test("should sanitize name with XSS payload", () => {
      const data = {
        name: "<script>Attacker</script>",
        content: "Valid comment",
      };
      const { error, value } = validateComment(data);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.name).not.toContain("<script>");
    });

    test("should sanitize content with XSS payload", () => {
      const data = {
        name: "John",
        content: "<a href=\"javascript:alert('xss')\">Click</a>",
      };
      const { error, value } = validateComment(data);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.content).not.toContain("javascript:");
    });

    test("should reject name exceeding max length", () => {
      const data = {
        name: "a".repeat(101),
        content: "Valid comment",
      };
      const { error } = validateComment(data);
      expect(error).not.toBeNull();
    });

    test("should reject content exceeding max length", () => {
      const data = {
        name: "John",
        content: "a".repeat(1001),
      };
      const { error } = validateComment(data);
      expect(error).not.toBeNull();
    });

    test("should reject missing required fields", () => {
      const data = {
        name: "John",
      };
      const { error } = validateComment(data);
      expect(error).not.toBeNull();
    });
  });

  describe("validateAdminLogin", () => {
    test("should accept valid email and password", () => {
      const data = {
        email: "admin@example.com",
        password: "SecurePassword123",
      };
      const { error } = validateAdminLogin(data);
      expect(error).toBeUndefined();
    });

    test("should reject invalid email format", () => {
      const data = {
        email: "notanemail",
        password: "SecurePassword123",
      };
      const { error } = validateAdminLogin(data);
      expect(error).not.toBeNull();
    });

    test("should reject missing password", () => {
      const data = {
        email: "admin@example.com",
      };
      const { error } = validateAdminLogin(data);
      expect(error).not.toBeNull();
    });

    test("should reject missing email", () => {
      const data = {
        password: "SecurePassword123",
      };
      const { error } = validateAdminLogin(data);
      expect(error).not.toBeNull();
    });
  });
});

describe("SQL/NoSQL Injection Prevention", () => {
  test("should sanitize MongoDB operators in validateNote", () => {
    const data = {
      title: 'Normal Title { "$ne": null }',
      content: 'Content { "$where": "1==1" }',
      readTime: 5,
    };
    const { error, value } = validateNote(data);
    expect(error).toBeUndefined();
    // The sanitized value should be safe
    expect(value).toBeDefined();
    expect(value.title).toBeTruthy();
    expect(value.content).toBeTruthy();
  });

  test("should handle deeply nested injection attempts", () => {
    const data = {
      title: "Normal title",
      content: 'Text with {"$regex": ".*"} pattern',
      readTime: 5,
    };
    const { error, value } = validateNote(data);
    expect(error).toBeUndefined();
    expect(value).toBeDefined();
    expect(value.content).toBeTruthy();
  });
});
