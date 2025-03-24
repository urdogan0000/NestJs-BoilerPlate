// common.func.spec.ts

import { HttpException } from '@nestjs/common';
import {
  decodeBase64toString,
  basicAuthDecoder,
} from 'src/common/funcs/common.func';

describe('Common Functions', () => {
  describe('decodeBase64toString', () => {
    it('should decode a base64 string to UTF-8', () => {
      const base64String = 'SGVsbG8gd29ybGQ='; // "Hello world" in base64
      const decodedString = decodeBase64toString(base64String);
      expect(decodedString).toBe('Hello world');
    });

    it('should return an empty string for empty base64 input', () => {
      const decodedString = decodeBase64toString('');
      expect(decodedString).toBe('');
    });
  });

  describe('basicAuthDecoder', () => {
    it('should decode valid Basic Authorization header', () => {
      const authHeader = 'Basic YWRtaW46c2VjcmV0'; // admin:secret in base64
      const { username, password } = basicAuthDecoder(authHeader);
      expect(username).toBe('admin');
      expect(password).toBe('secret');
    });

    it('should throw HttpException for invalid base64 string', () => {
      expect(() => {
        basicAuthDecoder('Basic invalid_base64');
      }).toThrow(HttpException);
    });

    it('should throw HttpException if username or password is missing', () => {
      expect(() => {
        basicAuthDecoder('Basic YWRtaW46'); // username without password
      }).toThrow(HttpException);
    });
  });
});
