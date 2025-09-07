// Mock jose library to avoid ESM issues in tests
module.exports = {
  compactDecrypt: jest.fn(),
  EncryptJWT: jest.fn(),
  jwtDecrypt: jest.fn(),
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
  importJWK: jest.fn(),
  generateKeyPair: jest.fn(),
};