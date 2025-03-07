/* eslint-disable */
export default {
  displayName: "amplication-storage-gateway",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/amplication-storage-gateway",
  coverageThreshold: {
    global: {
      branches: 35.9,
      lines: 9.9,
    },
  },
};
