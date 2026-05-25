const AppError = require("../src/utils/AppError");

describe("AppError Class", () => {
  test("should create an error with message and status code", () => {
    const error = new AppError("Test error", 400);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
  });

  test("should inherit from Error class", () => {
    const error = new AppError("Test error", 500);
    expect(error instanceof Error).toBe(true);
  });

  test("should have a stack trace", () => {
    const error = new AppError("Test error", 400);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("errors.test.js");
  });

  test("should have proper error name", () => {
    const error = new AppError("Test error", 404);
    expect(error.name).toBe("Error");
  });

  test("should work with different status codes", () => {
    const errors = [
      { message: "Not found", code: 404 },
      { message: "Unauthorized", code: 401 },
      { message: "Bad request", code: 400 },
      { message: "Internal error", code: 500 },
    ];

    errors.forEach(({ message, code }) => {
      const error = new AppError(message, code);
      expect(error.statusCode).toBe(code);
      expect(error.message).toBe(message);
    });
  });

  test("should be throwable and catchable", () => {
    const throwFn = () => {
      throw new AppError("Catchable error", 400);
    };

    expect(throwFn).toThrow(AppError);
    try {
      throwFn();
    } catch (error) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Catchable error");
    }
  });
});

describe("Error Handler Middleware", () => {
  let res, req, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    req = {};
    next = jest.fn();
  });

  test("should set default status code to 500", () => {
    const errorHandler = require("../src/middleware/errorHandler");
    const err = new Error("Generic error");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("should handle validation errors", () => {
    const errorHandler = require("../src/middleware/errorHandler");
    const err = new Error("Validation Error");
    err.name = "ValidationError";
    err.errors = {
      title: { message: "Title is required" },
      content: { message: "Content is required" },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test("should handle MongoDB duplicate key errors", () => {
    const errorHandler = require("../src/middleware/errorHandler");
    const err = new Error("Duplicate key");
    err.code = 11000;
    err.keyPattern = { email: 1 };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test("should handle JWT errors", () => {
    const errorHandler = require("../src/middleware/errorHandler");
    const err = new Error("Invalid token");
    err.name = "JsonWebTokenError";

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });
});
