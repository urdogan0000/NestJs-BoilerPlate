import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';

/**
 * Decodes a Base64-encoded string into a UTF-8 string.
 *
 * @param input The Base64 encoded input string.
 * @returns The decoded UTF-8 string.
 */
export function decodeBase64toString(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

/**
 * Decodes a Basic Authentication header into username and password.
 *
 * @param input The "Authorization" header string that contains the Basic authentication credentials.
 * @returns An object containing the username and password.
 * @throws {HttpException} If the input is invalid or authentication fails.
 */
export function basicAuthDecoder(input: string): {
  username: string;
  password: string;
} {
  if (!input || !input.startsWith('Basic ')) {
    return { username: '', password: '' };
  }

  const base64String = input.slice(6).trim(); // Remove "Basic " prefix

  if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) {
    throw new HttpException('Authentication failed', 401);
  }

  const decoded = Buffer.from(base64String, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  if (!username?.trim() || !password?.trim()) {
    throw new HttpException('Username and password cannot be empty', 401);
  }

  return {
    username: username.trim(),
    password: password.trim(),
  };
}

/**
 * Reads configuration from a text file and loads it into a Map.
 * Each line in the file should be in the format of "key=value".
 *
 * @param configMap The Map to store the configuration values.
 * @param txtFileName The name of the text file containing the configuration.
 * @param txtFilePath The optional path to the directory where the text file is located.
 * @throws {Error} If the file cannot be read or the format is incorrect.
 */
export async function loadConfig(
  configMap: Map<string, string>,
  txtFileName: string,
  txtFilePath?: string,
): Promise<void> {
  const configPath = path.join(txtFilePath, txtFileName);
  const data = fs.readFileSync(configPath, 'utf8');
  const lines = data.split('\n').filter((line) => line.trim());

  lines.forEach((line) => {
    const indexOfEqual = line.indexOf('=');
    if (indexOfEqual > -1) {
      const key = line.substring(0, indexOfEqual).trim();
      const value = line.substring(indexOfEqual + 1).trim();
      if (key && value) {
        configMap.set(key, value);
      }
    }
  });
}

/**
 * Retrieves the client's IP address from the request.
 *
 * @param request The incoming HTTP request.
 * @returns The client's IP address.
 */
export function getClientIp(request: Request): string {
  const xff: string | undefined = request.headers['x-forwarded-for'] as string;

  if (xff && xff.trim() !== '') {
    return xff.split(',')[0].trim(); // Extract the first IP in case of multiple
  }

  return (
    request.socket?.remoteAddress ||
    request.connection?.remoteAddress ||
    request.ip ||
    'Unknown IP'
  );
}
