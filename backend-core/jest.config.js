module.exports = {
  testEnvironment: "node",
  testTimeout: 20000,
  roots: ["<rootDir>/tests"],
  globalSetup: "<rootDir>/tests/setup/globalSetup.js",
  setupFiles: ["<rootDir>/tests/setup/useTestDatabase.js"],
};
