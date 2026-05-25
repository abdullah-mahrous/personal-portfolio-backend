module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js", "**/*.spec.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/swagger/**", "!src/config/**"],
  verbose: true,
  testTimeout: 10000,
};
