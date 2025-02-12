// common.func.spec.ts

import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  decodeBase64toString,
  basicAuthDecoder,
  loadConfig,
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

  describe('loadConfig', () => {
    const mockFs = jest.spyOn(fs, 'readFileSync');
    const mockPathJoin = jest.spyOn(path, 'join');

    afterEach(() => {
      jest.resetAllMocks(); // Reset all mocks between tests
    });

    it('should load configuration file into a Map', async () => {
      const configMap = new Map<string, string>();
      const filePath = '/path/to/config';
      const fileName = 'ldap-config.txt';

      mockPathJoin.mockReturnValue('/path/to/config/ldap-config.txt');
      mockFs.mockReturnValue('LDAP_URL=ldap://localhost\nLDAP_PORT=389\n');

      await loadConfig(configMap, fileName, filePath);

      expect(configMap.get('LDAP_URL')).toBe('ldap://localhost');
      expect(configMap.get('LDAP_PORT')).toBe('389');
      expect(mockPathJoin).toHaveBeenCalledWith(filePath, fileName);
      expect(mockFs).toHaveBeenCalledWith(
        '/path/to/config/ldap-config.txt',
        'utf8',
      );
    });

    it('should handle empty lines and trim values', async () => {
      const configMap = new Map<string, string>();
      const filePath = '/path/to/config';
      const fileName = 'ldap-config.txt';

      mockPathJoin.mockReturnValue('/path/to/config/ldap-config.txt');
      mockFs.mockReturnValue(`
        LDAP_URL= ldap://localhost  
        LDAP_PORT = 389
        # Comment line
      `);

      await loadConfig(configMap, fileName, filePath);

      expect(configMap.get('LDAP_URL')).toBe('ldap://localhost');
      expect(configMap.get('LDAP_PORT')).toBe('389');
      expect(configMap.size).toBe(2); // Ensure only 2 valid entries
    });

    it('should ignore lines without "=" character', async () => {
      const configMap = new Map<string, string>();
      const filePath = '/path/to/config';
      const fileName = 'ldap-config.txt';

      mockPathJoin.mockReturnValue('/path/to/config/ldap-config.txt');
      mockFs.mockReturnValue(
        'LDAP_URL=ldap://localhost\nINVALID_LINE\nLDAP_PORT=389\n',
      );

      await loadConfig(configMap, fileName, filePath);

      expect(configMap.get('LDAP_URL')).toBe('ldap://localhost');
      expect(configMap.get('LDAP_PORT')).toBe('389');
      expect(configMap.has('INVALID_LINE')).toBe(false);
    });
  });
});
