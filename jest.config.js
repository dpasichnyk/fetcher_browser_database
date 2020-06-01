module.exports = {
  testEnvironment: 'node',
  "roots": [
    "<rootDir>"
  ],
  testRegex: '(/test/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'json',
    'node',
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
};
