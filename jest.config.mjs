export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  verbose: true
}; 